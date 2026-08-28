import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import type { Application, Recruit, RecruitListResponse } from "./types";
import type { CreateRecruitInput } from "@/schema/recruit";

export function fetchRecruitList(techStackFilter?: string[], cursor?: string) {
  const params = new URLSearchParams();
  if (techStackFilter?.length) params.set("stack", techStackFilter.join(","));
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return apiGet<RecruitListResponse>(`/api/recruit${query ? `?${query}` : ""}`);
}

export function fetchRecruitDetail(id: string) {
  return apiGet<Recruit>(`/api/recruit/${id}`);
}

export function createRecruit(input: CreateRecruitInput) {
  return apiPost<Recruit>("/api/recruit", input);
}

export function applyToRecruit(recruitId: string, message?: string) {
  return apiPost<Application>("/api/applications", { recruitId, message });
}

export function deleteRecruit(id: string) {
  return apiDelete<{ deleted: boolean }>(`/api/recruit/${id}`);
}
