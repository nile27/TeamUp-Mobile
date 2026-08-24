import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/features/auth/use-session";
import { COLORS } from "@/config/theme";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTintColor: COLORS.ink,
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: COLORS.inkSoft,
      }}
    >
      <Tabs.Screen name="recruit/index" options={{ title: "모집" }} />
      <Tabs.Screen name="recruit/[id]" options={{ href: null, title: "모집 상세" }} />
      <Tabs.Screen name="dashboard" options={{ title: "마이페이지" }} />
    </Tabs>
  );
}
