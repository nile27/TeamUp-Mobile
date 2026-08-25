import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRecruitDetail, fetchRecruitList } from "./api";
import { supabase } from "@/server/supabase";

export function useRecruitList(techStackFilter?: string[]) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["recruit-list", techStackFilter ?? []],
    queryFn: () => fetchRecruitList(techStackFilter),
  });

  // 웹에서 새 모집이 올라오거나 상태가 바뀌어도 새로고침 없이 바로 보이도록,
  // 마이페이지 지원 상태와 같은 방식으로 Recruit 테이블 변경을 구독.
  // 모집 목록은 비로그인도 보는 공개 데이터라 로그인 여부와 무관하게 항상 구독.
  useEffect(() => {
    const channel = supabase
      .channel("recruit-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Recruit" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["recruit-list"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useRecruitDetail(id: string) {
  return useQuery({
    queryKey: ["recruit-detail", id],
    queryFn: () => fetchRecruitDetail(id),
    enabled: !!id,
  });
}
