import { router } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth/use-session";
import { useDashboard } from "@/features/dashboard/queries";
import { useDeleteRecruit } from "@/features/recruit/mutations";
import { useDeleteCommunityPost } from "@/features/community/mutations";
import { supabase } from "@/server/supabase";
import { ApiError } from "@/lib/api-client";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

export default function DashboardScreen() {
  const { session, isLoading: isSessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useDashboard(!!session);
  const deleteRecruitMutation = useDeleteRecruit();
  const deletePostMutation = useDeleteCommunityPost();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  const handleDeleteRecruit = (id: string) => {
    Alert.alert("이 모집글을 삭제할까요?", "지원 내역을 포함해 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteRecruitMutation.mutate(id, {
            onError: (error) => {
              Alert.alert("삭제 실패", error instanceof ApiError ? error.message : "삭제 중 오류가 발생했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleDeletePost = (id: string) => {
    Alert.alert("이 글을 삭제할까요?", "댓글을 포함해 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate(id, {
            onError: (error) => {
              Alert.alert("삭제 실패", error instanceof ApiError ? error.message : "삭제 중 오류가 발생했습니다.");
            },
          });
        },
      },
    ]);
  };

  if (isSessionLoading || (session && isLoading)) {
    return (
      <View className="flex-1 gap-4 bg-white p-4">
        <View className="h-8 w-32 rounded-md bg-gray-100" />
        <View className="h-16 w-full rounded-xl bg-gray-100" />
        <View className="h-16 w-full rounded-xl bg-gray-100" />
        <View className="h-16 w-full rounded-xl bg-gray-100" />
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">마이페이지는 로그인 후 이용할 수 있어요.</Text>
        <Button
          onPress={() => router.push("/(auth)/login")}
          className="rounded-lg bg-amber px-4 py-2 shadow-none"
        >
          <Text className="font-semibold text-ink">로그인하기</Text>
        </Button>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">마이페이지를 불러오지 못했어요.</Text>
        <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-4 gap-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold tracking-tight text-ink">
          {data.profile?.nickname ?? "마이페이지"}
        </Text>
        <Pressable onPress={handleLogout}>
          <Text className="text-sm text-ink-soft">로그아웃</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-ink">내 모집글</Text>
        {data.myRecruits.length === 0 ? (
          <Text className="text-ink-soft">아직 등록한 모집글이 없어요.</Text>
        ) : (
          <View className="gap-2">
            {data.myRecruits.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center gap-3 rounded-xl border-0 bg-gray-50 px-4 py-3.5 shadow-none"
              >
                <Pressable
                  className="flex-1"
                  onPress={() => router.push(`/(app)/recruit/${item.id}`)}
                >
                  <Text className="text-ink" numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
                <Button
                  variant="destructive"
                  size="sm"
                  onPress={() => handleDeleteRecruit(item.id)}
                  disabled={deleteRecruitMutation.isPending}
                >
                  <Text>삭제</Text>
                </Button>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-ink">내 작성글</Text>
        {data.myPosts.length === 0 ? (
          <Text className="text-ink-soft">아직 작성한 커뮤니티 글이 없어요.</Text>
        ) : (
          <View className="gap-2">
            {data.myPosts.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center gap-3 rounded-xl border-0 bg-gray-50 px-4 py-3.5 shadow-none"
              >
                <Pressable
                  className="flex-1"
                  onPress={() => router.push(`/(app)/community/${item.id}`)}
                >
                  <Text className="text-ink" numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
                <Button
                  variant="destructive"
                  size="sm"
                  onPress={() => handleDeletePost(item.id)}
                  disabled={deletePostMutation.isPending}
                >
                  <Text>삭제</Text>
                </Button>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-ink">지원한 모집</Text>
        {data.myApplications.length === 0 ? (
          <Text className="text-ink-soft">아직 지원한 모집이 없어요.</Text>
        ) : (
          <View className="gap-2">
            {data.myApplications.map((item) => (
              <Pressable key={item.id} onPress={() => router.push(`/(app)/recruit/${item.recruit.id}`)}>
                <Card className="flex-row items-center gap-3 rounded-xl border-0 bg-gray-50 px-4 py-3.5 shadow-none">
                  <Text className="flex-1 text-ink" numberOfLines={1}>
                    {item.recruit.title}
                  </Text>
                  <View className="shrink-0 rounded-full bg-gray-100 px-2 py-1">
                    <Text className="text-xs text-ink-soft">{APPLICATION_STATUS_LABEL[item.status]}</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
