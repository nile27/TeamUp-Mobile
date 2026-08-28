import { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { useSession } from "@/features/auth/use-session";
import { useCommunityDetail } from "@/features/community/queries";
import {
  useAddCommunityComment,
  useDeleteCommunityPost,
  useToggleCommunityLike,
} from "@/features/community/mutations";
import { COMMUNITY_TAG_LABEL } from "@/config/labels";
import { ApiError } from "@/lib/api-client";
import { COLORS } from "@/config/theme";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data: post, isLoading, isError, refetch } = useCommunityDetail(id);
  // React Query의 isRefetching을 그대로 RefreshControl에 연결했더니, 댓글 등록/좋아요
  // 후 백그라운드 invalidateQueries로 일어나는 재조회에도 pull-to-refresh 스피너가
  // 저절로 떠버렸음(사용자가 안 당겼는데도) — 실제로 당겨서 새로고침했을 때만 켜지는
  // 별도 상태로 분리.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };
  const likeMutation = useToggleCommunityLike(id);
  const commentMutation = useAddCommunityComment(id);
  const deleteMutation = useDeleteCommunityPost();
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // isPending은 mutate() 호출 후 리렌더가 반영돼야 true가 되는데, 연속 탭이 그 리렌더
  // 사이에 다 들어오면 매번 새 toggle 요청이 겹쳐 나가서 최종 상태가 꼬였음(연타 버그) —
  // 리렌더를 기다리지 않는 ref로 동기 가드.
  const isLikeMutatingRef = useRef(false);

  if (isLoading) {
    return (
      <View className="flex-1 gap-4 bg-white p-4">
        <View className="h-6 w-20 rounded-md bg-gray-100" />
        <View className="h-8 w-3/4 rounded-md bg-gray-100" />
        <View className="h-4 w-1/2 rounded-md bg-gray-100" />
        <View className="h-16 w-full rounded-xl bg-gray-100" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">글을 불러오지 못했어요.</Text>
        <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Button>
      </View>
    );
  }

  const isAuthor = !!session && post.author.id === session.user.id;

  const handleDelete = () => {
    Alert.alert("이 글을 삭제할까요?", "댓글을 포함해 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setDeleteError(null);
          deleteMutation.mutate(id, {
            onSuccess: () => router.back(),
            onError: (error) => {
              setDeleteError(error instanceof ApiError ? error.message : "삭제 중 오류가 발생했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleLike = () => {
    if (!session) {
      router.push("/(auth)/login");
      return;
    }
    if (isLikeMutatingRef.current) return;
    isLikeMutatingRef.current = true;
    likeMutation.mutate(undefined, {
      onSettled: () => {
        isLikeMutatingRef.current = false;
      },
    });
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
    // 탭 네비게이터 안(react-native-screens Fragment) 화면이라 RN 기본 Keyboard
    // 이벤트/adjustResize/react-native-keyboard-aware-scroll-view 전부 안 먹혔음 —
    // 네이티브로 키보드 위치를 직접 추적하는 react-native-keyboard-controller로 해결.
    // mode="layout"이라 mt-auto인 입력 바가 키보드 공간만큼 실제로 밀려 올라옴.
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: COLORS.canvas }}
      contentContainerStyle={{ flexGrow: 1 }}
      mode="layout"
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleManualRefresh} />}
    >
      <View className="gap-4 p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-2">
            <View className="self-start rounded-md bg-amber-soft px-2 py-1">
              <Text className="text-xs font-semibold text-amber-deep">{COMMUNITY_TAG_LABEL[post.tag]}</Text>
            </View>
            <Text className="text-2xl font-extrabold tracking-tight text-ink">{post.title}</Text>
          </View>
          {isAuthor && (
            <Button
              variant="destructive"
              size="sm"
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Text>삭제</Text>
            </Button>
          )}
        </View>
        {deleteError && <Text className="text-sm text-red-500">{deleteError}</Text>}
        <View className="flex-row items-center gap-2">
          <Avatar name={post.author.nickname} size={28} />
          <Text className="text-sm text-ink-soft">{post.author.nickname}</Text>
        </View>
        <Text className="leading-6 text-ink">{post.content}</Text>

        <Button
          variant="ghost"
          onPress={handleLike}
          disabled={likeMutation.isPending}
          className={`flex-row items-center gap-1.5 self-start rounded-full border px-4 py-2 shadow-none ${
            post.alreadyLiked ? "border-amber bg-amber-soft" : "border-gray-300"
          }`}
        >
          <Ionicons
            name={post.alreadyLiked ? "heart" : "heart-outline"}
            size={16}
            color={post.alreadyLiked ? COLORS.amberDeep : COLORS.inkSoft}
          />
          <Text className={post.alreadyLiked ? "font-semibold text-ink" : "text-ink-soft"}>
            {post._count.likes}
          </Text>
        </Button>

        <Text className="mt-2 text-sm font-semibold text-ink">댓글 {post._count.comments}</Text>

        {post.comments.length === 0 ? (
          <Text className="text-ink-soft">아직 댓글이 없어요.</Text>
        ) : (
          <View className="gap-3">
            {post.comments.map((item) => (
              <Card key={item.id} className="flex-row gap-3 rounded-lg border-0 bg-gray-50 p-3 shadow-none">
                <Avatar name={item.author.nickname} size={24} />
                <View className="flex-1 gap-1">
                  <Text className="text-xs text-ink-soft">{item.author.nickname}</Text>
                  <Text className="text-ink">{item.content}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View className="mt-auto border-t border-gray-100 bg-white p-4">
        {commentError && <Text className="mb-2 text-sm text-red-500">{commentError}</Text>}
        <View className="flex-row items-center gap-2">
          <Input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-ink"
            placeholder={session ? "댓글을 입력하세요" : "로그인 후 댓글을 남길 수 있어요"}
            value={commentText}
            onChangeText={setCommentText}
          />
          <Button
            onPress={handleComment}
            disabled={session ? commentMutation.isPending || !commentText.trim() : false}
            className={`rounded-lg px-4 py-2 shadow-none ${
              session && (commentMutation.isPending || !commentText.trim()) ? "bg-gray-200" : "bg-amber"
            }`}
          >
            <Text className="font-semibold text-ink">{session ? "등록" : "로그인"}</Text>
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
