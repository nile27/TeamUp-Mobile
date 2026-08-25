import { useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDashboard } from "./api";
import { supabase } from "@/server/supabase";
import { useSession } from "@/features/auth/use-session";

export function useDashboard(enabled: boolean) {
  const queryClient = useQueryClient();
  const { session } = useSession();

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled,
  });

  // 지원 수락/거절처럼 다른 사람(모집 작성자)이 바꾸는 상태는 60초 staleTime 캐시로는
  // 늦게 반영됨 — 탭 진입 시 강제 갱신(폴백)에 더해, Supabase Realtime으로 내 Application row가
  // 바뀌는 순간 바로 캐시를 무효화해 새로고침 없이도 반영되게 함.
  useFocusEffect(
    useCallback(() => {
      if (enabled) query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled])
  );

  useEffect(() => {
    if (!enabled || !session) return;

    const channel = supabase
      .channel(`applications-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Application",
          filter: `applicantId=eq.${session.user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, session, queryClient]);

  return query;
}
