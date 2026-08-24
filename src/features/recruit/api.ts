import { apiGet, apiPost } from "@/lib/api-client";
import type { Application, Recruit } from "./types";
import type { CreateRecruitInput } from "@/schema/recruit";

export function fetchRecruitList(techStackFilter?: string[]) {
  const query = techStackFilter?.length ? `?stack=${techStackFilter.join(",")}` : "";
  return apiGet<Recruit[]>(`/api/recruit${query}`);
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
