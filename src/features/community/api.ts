import { apiGet, apiPost } from "@/lib/api-client";
import type { Comment, CommunityListResponse, CommunityPostDetail, CommunityTag } from "./types";

export function fetchCommunityList(tag?: CommunityTag, page = 1) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  params.set("page", String(page));
  return apiGet<CommunityListResponse>(`/api/community?${params.toString()}`);
}

export function fetchCommunityDetail(id: string) {
  return apiGet<CommunityPostDetail>(`/api/community/${id}`);
}

export function toggleCommunityLike(id: string) {
  return apiPost<{ liked: boolean; count: number }>(`/api/community/${id}/like`, {});
}

export function postCommunityComment(id: string, content: string) {
  return apiPost<Comment>(`/api/community/${id}/comments`, { content });
}
