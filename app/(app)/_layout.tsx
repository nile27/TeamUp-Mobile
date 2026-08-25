import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/features/auth/use-session";
import { COLORS } from "@/config/theme";

export default function AppLayout() {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  // 모집 목록·상세는 비로그인도 볼 수 있음(API가 토큰 없이도 응답) — "둘러보기".
  // 로그인이 실제로 필요한 지점(지원하기, 마이페이지)은 각 화면에서 개별적으로 가드.
  return (
    <Tabs
      screenOptions={{
        headerTintColor: COLORS.ink,
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: COLORS.inkSoft,
      }}
    >
      <Tabs.Screen
        name="recruit/index"
        options={{
          title: "모집",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="recruit/[id]" options={{ href: null, title: "모집 상세" }} />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
