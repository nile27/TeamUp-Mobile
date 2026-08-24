import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useDashboard } from "@/features/dashboard/queries";
import { supabase } from "@/server/supabase";
import { COLORS } from "@/config/theme";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

export default function DashboardScreen() {
  const { data, isLoading, isError, refetch } = useDashboard();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">마이페이지를 불러오지 못했어요.</Text>
        <Pressable onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-ink">{data.profile?.nickname ?? "마이페이지"}</Text>
        <Pressable onPress={handleLogout}>
          <Text className="text-sm text-ink-soft">로그아웃</Text>
        </Pressable>
      </View>

      <Text className="mb-2 text-sm font-semibold text-ink">지원한 모집</Text>
      {data.myApplications.length === 0 ? (
        <Text className="text-ink-soft">아직 지원한 모집이 없어요.</Text>
      ) : (
        <FlatList
          data={data.myApplications}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/recruit/${item.recruit.id}`)}
              className="flex-row items-center justify-between rounded-lg border border-gray-100 px-3 py-3"
            >
              <Text className="flex-1 text-ink" numberOfLines={1}>
                {item.recruit.title}
              </Text>
              <Text className="text-xs text-ink-soft">{APPLICATION_STATUS_LABEL[item.status]}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
