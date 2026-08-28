import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/features/auth/use-session";
import { AppHeader } from "@/components/app-header";
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
      // 하드웨어 뒤로가기를 눌렀을 때 방금 있던 탭으로 거슬러 올라가게(기본값은
      // 어느 탭에 있든 한 번에 바로 앱 종료) — 대부분의 탭 기반 앱이 쓰는 방식.
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: COLORS.inkSoft,
        // 탭 화면(커뮤니티 상세 등) 안에 있는 입력창이 키보드에 가려지는 문제 —
        // 하단 탭 바가 항상 떠있는 상태로 리사이즈 계산에 끼어드는 게 원인이었음.
        // 키보드 뜨면 탭 바 자체를 숨겨서 공간을 온전히 확보.
        tabBarHideOnKeyboard: true,
        // 기본 헤더(작은 타이틀 텍스트 하나뿐)가 개성 없다는 피드백 — 워드마크 +
        // 로그인 사용자 아바타/로그인 버튼을 넣은 커스텀 헤더로 교체.
        // 뒤로가기 버튼은 router.canGoBack()으로 판단했더니 탭 네비게이터 구조
        // 특성상 일관되게 안 나와서(같은 방식인데 모집 상세엔 안 뜨고 커뮤니티
        // 글엔 뜨는 등), 화면이 탭 루트인지 하위 화면인지를 명시적으로 표시하는
        // showBackButton 옵션으로 대체.
        header: ({ options }) => (
          <AppHeader
            title={options.title}
            session={session}
            showBackButton={(options as { showBackButton?: boolean }).showBackButton}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="recruit/index"
        options={{
          title: "모집",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recruit/[id]"
        options={{ href: null, title: "모집 상세", showBackButton: true } as never}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community/[id]"
        options={{ href: null, title: "커뮤니티 글", showBackButton: true } as never}
      />
      {/* 마이페이지는 하단 탭에서 빼고 헤더 아바타로만 진입 — 그래서 하위 화면처럼
      뒤로가기 버튼을 보여줌. */}
      <Tabs.Screen
        name="dashboard"
        options={{ href: null, title: "마이페이지", showBackButton: true } as never}
      />
    </Tabs>
  );
}
