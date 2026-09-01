import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyToRecruit, deleteRecruit, updateApplicationStatus } from "./api";

export function useApplyToRecruit(recruitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message?: string) => applyToRecruit(recruitId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruit-detail", recruitId] });
    },
  });
}

export function useUpdateApplicationStatus(recruitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: "ACCEPTED" | "REJECTED" }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruit-applicants", recruitId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteRecruit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recruitId: string) => deleteRecruit(recruitId),
    onSuccess: () => {
      // 삭제된 모집이 Realtime으로도 목록에서 빠지지만, 구독 왕복을 기다릴 필요 없이
      // 삭제한 화면에서 바로 최신 상태로 보이도록 즉시 무효화.
      queryClient.invalidateQueries({ queryKey: ["recruit-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
