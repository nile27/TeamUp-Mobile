import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCommunityDetail, fetchCommunityList } from "./api";
import { supabase } from "@/server/supabase";
import type { CommunityTag } from "./types";

export function useCommunityList(tag?: CommunityTag, page = 1) {
  return useQuery({
    queryKey: ["community-list", tag ?? null, page],
    queryFn: () => fetchCommunityList(tag, page),
  });
}

export function useCommunityDetail(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["community-detail", id],
    queryFn: () => fetchCommunityDetail(id),
    enabled: !!id,
  });

  // 다른 사람이 이 글에 좋아요/댓글을 남겨도 새로고침 없이 바로 보이도록,
  // 지원 상태·모집 목록과 같은 방식으로 Comment/CommunityPostLike를 구독.
  // 채널명은 recruit-list 때 겪었던 "고정 이름 충돌 크래시"를 피하려고
  // 훅 인스턴스마다 고유하게 생성.
  const channelName = useRef(`community-detail-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Comment", filter: `postId=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["community-detail", id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "CommunityPostLike", filter: `postId=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["community-detail", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient, channelName]);

  return query;
}
