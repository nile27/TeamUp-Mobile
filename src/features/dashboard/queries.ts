import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "./api";

export function useDashboard() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  // 지원 수락/거절처럼 다른 사람(모집 작성자)이 바꾸는 상태는 60초 staleTime 캐시로는
  // 늦게 반영됨 — 마이페이지 탭에 다시 들어올 때마다 최신 상태로 강제 갱신.
  useFocusEffect(
    useCallback(() => {
      query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return query;
}
