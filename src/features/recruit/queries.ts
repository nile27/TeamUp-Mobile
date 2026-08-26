import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRecruitDetail, fetchRecruitList } from "./api";
import { supabase } from "@/server/supabase";

export function useRecruitList(techStackFilter?: string[]) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["recruit-list", techStackFilter ?? []],
    queryFn: () => fetchRecruitList(techStackFilter),
  });

  // Supabase Realtime은 채널을 이름(topic)으로 관리해서, 같은 이름의 채널이
  // 동시에 두 개 이상 구독되면 두 번째가 크래시함("cannot add postgres_changes
  // callbacks ... after subscribe()"). 탭 네비게이션에서 이전 화면 인스턴스가
  // 완전히 언마운트되기 전에 이 훅이 다시 마운트되는 경우가 있어(예: 비로그인
  // 둘러보기 → 로그인 직후 재진입) 고정 문자열 대신 인스턴스별 고유 이름을 씀.
  const channelName = useRef(`recruit-list-${Math.random().toString(36).slice(2)}`).current;

  // 웹에서 새 모집이 올라오거나 상태가 바뀌어도 새로고침 없이 바로 보이도록,
  // 마이페이지 지원 상태와 같은 방식으로 Recruit 테이블 변경을 구독.
  // 모집 목록은 비로그인도 보는 공개 데이터라 로그인 여부와 무관하게 항상 구독.
  useEffect(() => {
    const channel = supabase
      .channel(channelName)
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
  }, [queryClient, channelName]);

  return query;
}

export function useRecruitDetail(id: string) {
  return useQuery({
    queryKey: ["recruit-detail", id],
    queryFn: () => fetchRecruitDetail(id),
    enabled: !!id,
  });
}
