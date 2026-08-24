import { useQuery } from "@tanstack/react-query";
import { fetchRecruitDetail, fetchRecruitList } from "./api";

export function useRecruitList(techStackFilter?: string[]) {
  return useQuery({
    queryKey: ["recruit-list", techStackFilter ?? []],
    queryFn: () => fetchRecruitList(techStackFilter),
  });
}

export function useRecruitDetail(id: string) {
  return useQuery({
    queryKey: ["recruit-detail", id],
    queryFn: () => fetchRecruitDetail(id),
    enabled: !!id,
  });
}
