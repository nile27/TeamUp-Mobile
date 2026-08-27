import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth/use-session";
import { useDashboard } from "@/features/dashboard/queries";
import { supabase } from "@/server/supabase";
import { COLORS } from "@/config/theme";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

export default function DashboardScreen() {
  const { session, isLoading: isSessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useDashboard(!!session);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  if (isSessionLoading || (session && isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
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
          className="flex-1"
          data={data.myApplications}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/recruit/${item.recruit.id}`)}>
              <Card className="flex-row items-center gap-2 rounded-lg border border-gray-100 px-3 py-3 shadow-none">
                <Text className="flex-1 text-ink" numberOfLines={1}>
                  {item.recruit.title}
                </Text>
                <View className="shrink-0 rounded-full bg-gray-100 px-2 py-1">
                  <Text className="text-xs text-ink-soft">{APPLICATION_STATUS_LABEL[item.status]}</Text>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
