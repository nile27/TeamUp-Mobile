import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyToRecruit } from "./api";

export function useApplyToRecruit(recruitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message?: string) => applyToRecruit(recruitId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruit-detail", recruitId] });
    },
  });
}
