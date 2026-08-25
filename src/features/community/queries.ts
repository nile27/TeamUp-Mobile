import { useQuery } from "@tanstack/react-query";
import { fetchCommunityDetail, fetchCommunityList } from "./api";
import type { CommunityTag } from "./types";

export function useCommunityList(tag?: CommunityTag, page = 1) {
  return useQuery({
    queryKey: ["community-list", tag ?? null, page],
    queryFn: () => fetchCommunityList(tag, page),
  });
}

export function useCommunityDetail(id: string) {
  return useQuery({
    queryKey: ["community-detail", id],
    queryFn: () => fetchCommunityDetail(id),
    enabled: !!id,
  });
}
