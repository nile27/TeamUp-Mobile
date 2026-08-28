import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
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

  // 모집 목록·상세는 비로그인도 볼 수 있음(API가 토큰 없이도 응답) — "둘러보기".
  // 로그인이 실제로 필요한 지점(지원하기, 마이페이지)은 각 화면에서 개별적으로 가드.
  return (
    <Tabs
      screenOptions={{
        headerTintColor: COLORS.ink,
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: COLORS.inkSoft,
        // 탭 화면(커뮤니티 상세 등) 안에 있는 입력창이 키보드에 가려지는 문제 —
        // 하단 탭 바가 항상 떠있는 상태로 리사이즈 계산에 끼어드는 게 원인이었음.
        // 키보드 뜨면 탭 바 자체를 숨겨서 공간을 온전히 확보.
        tabBarHideOnKeyboard: true,
        // 비로그인 "둘러보기" 중엔 로그인 화면으로 돌아갈 직관적인 수단이 없었음 —
        // 헤더 오른쪽에 항상 보이는 로그인 버튼으로 어디서든 바로 돌아갈 수 있게.
        headerRight: () =>
          !session ? (
            <Pressable onPress={() => router.push("/(auth)/login")} className="mr-4">
              <Text className="font-semibold text-amber-deep">로그인</Text>
            </Pressable>
          ) : null,
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
        name="community/index"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="community/[id]" options={{ href: null, title: "커뮤니티 글" }} />
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
