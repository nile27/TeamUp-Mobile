import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommunityPost, postCommunityComment, toggleCommunityLike } from "./api";
import type { CommunityPostDetail } from "./types";

export function useToggleCommunityLike(postId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["community-detail", postId];

  return useMutation({
    mutationFn: () => toggleCommunityLike(postId),
    // 서버 응답 기다리면 탭했을 때 반응이 늦게 느껴져서, 누르는 즉시 화면부터 뒤집어 보여줌
    // (실패하면 onError에서 원래 상태로 되돌림).
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CommunityPostDetail>(queryKey);
      if (previous) {
        queryClient.setQueryData<CommunityPostDetail>(queryKey, {
          ...previous,
          alreadyLiked: !previous.alreadyLiked,
          _count: { ...previous._count, likes: previous._count.likes + (previous.alreadyLiked ? -1 : 1) },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: ({ liked, count }) => {
      queryClient.setQueryData<CommunityPostDetail>(queryKey, (prev) =>
        prev ? { ...prev, alreadyLiked: liked, _count: { ...prev._count, likes: count } } : prev
      );
    },
  });
}

export function useAddCommunityComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postCommunityComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-detail", postId] });
    },
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
