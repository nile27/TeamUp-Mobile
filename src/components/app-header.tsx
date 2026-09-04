import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { Session } from "@supabase/supabase-js";
import { Text } from "@/components/ui/text";
import { Avatar } from "@/components/avatar";
import { COLORS } from "@/config/theme";

// 기본 React Navigation 헤더(작은 타이틀 텍스트 하나뿐)가 "개성 없다"는 피드백 —
// 색은 그대로 흰 배경 유지하되(DESIGN.md 원칙: 앰버는 버튼/아이콘에만), 워드마크
// 타이포와 로그인 사용자 아바타로 브랜드 정체성을 줌.
export function AppHeader({
  title,
  session,
  showBackButton,
}: {
  title?: string;
  session: Session | null;
  showBackButton?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center gap-3">
        {showBackButton && (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
          </Pressable>
        )}
        <View className="flex-row items-baseline gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-amber" />
            <Text className="text-xl font-extrabold tracking-tight text-ink">TeamUp</Text>
          </View>
          {title && <Text className="text-sm text-ink-soft">{title}</Text>}
        </View>
      </View>

      {session ? (
        <Pressable onPress={() => router.push("/(app)/dashboard")}>
          <Avatar name={session.user.email ?? session.user.id} size={30} />
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text className="font-semibold text-amber-deep">로그인</Text>
        </Pressable>
      )}
    </View>
  );
}
