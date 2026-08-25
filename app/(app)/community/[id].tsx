import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSession } from "@/features/auth/use-session";
import { useCommunityDetail } from "@/features/community/queries";
import { useAddCommunityComment, useToggleCommunityLike } from "@/features/community/mutations";
import { COMMUNITY_TAG_LABEL } from "@/config/labels";
import { ApiError } from "@/lib/api-client";
import { COLORS } from "@/config/theme";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data: post, isLoading, isError, refetch } = useCommunityDetail(id);
  const likeMutation = useToggleCommunityLike(id);
  const commentMutation = useAddCommunityComment(id);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">글을 불러오지 못했어요.</Text>
        <Pressable onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const handleLike = () => {
    if (!session) {
      router.push("/(auth)/login");
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!session) {
      router.push("/(auth)/login");
      return;
    }
    if (!commentText.trim()) return;
    setCommentError(null);
    commentMutation.mutate(commentText.trim(), {
      onSuccess: () => setCommentText(""),
      onError: (error) => {
        setCommentError(error instanceof ApiError ? error.message : "댓글 작성 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      // Android는 Expo 기본값(adjustResize)이 OS 레벨에서 이미 화면을 줄여주는데,
      // 여기에 "height" 모드까지 더하면 절대 위치인 하단 입력창 계산이 꼬여서 오히려
      // 안 밀리는 문제가 있었음 — Android는 OS 리사이즈에 맡기고 behavior 없이 둠.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={post.comments}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-4 pb-24"
        ListHeaderComponent={
          <View className="mb-4 gap-3">
            <Text className="text-xs font-medium text-amber-deep">{COMMUNITY_TAG_LABEL[post.tag]}</Text>
            <Text className="text-xl font-bold text-ink">{post.title}</Text>
            <Text className="text-xs text-ink-soft">{post.author.nickname}</Text>
            <Text className="leading-6 text-ink">{post.content}</Text>

            <Pressable
              onPress={handleLike}
              disabled={likeMutation.isPending}
              className={`flex-row items-center gap-1.5 self-start rounded-full border px-4 py-2 ${
                post.alreadyLiked ? "border-amber bg-amber-soft" : "border-gray-300"
              }`}
            >
              <Text className="text-base">{post.alreadyLiked ? "❤️" : "🤍"}</Text>
              <Text className={post.alreadyLiked ? "font-semibold text-ink" : "text-ink-soft"}>
                {post._count.likes}
              </Text>
            </Pressable>

            <Text className="mt-2 text-sm font-semibold text-ink">댓글 {post._count.comments}</Text>
          </View>
        }
        ListEmptyComponent={<Text className="text-ink-soft">아직 댓글이 없어요.</Text>}
        renderItem={({ item }) => (
          <View className="rounded-lg bg-gray-50 p-3">
            <Text className="mb-1 text-xs text-ink-soft">{item.author.nickname}</Text>
            <Text className="text-ink">{item.content}</Text>
          </View>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
        {commentError && <Text className="mb-2 text-sm text-red-500">{commentError}</Text>}
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-ink"
            placeholder={session ? "댓글을 입력하세요" : "로그인 후 댓글을 남길 수 있어요"}
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable
            onPress={handleComment}
            disabled={session ? commentMutation.isPending || !commentText.trim() : false}
            className={`rounded-lg px-4 py-2 ${
              session && (commentMutation.isPending || !commentText.trim()) ? "bg-gray-200" : "bg-amber"
            }`}
          >
            <Text className="font-semibold text-ink">{session ? "등록" : "로그인"}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
