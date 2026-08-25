import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postCommunityComment, toggleCommunityLike } from "./api";
import type { CommunityPostDetail } from "./types";

export function useToggleCommunityLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleCommunityLike(postId),
    onSuccess: ({ liked, count }) => {
      queryClient.setQueryData<CommunityPostDetail>(["community-detail", postId], (prev) =>
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
