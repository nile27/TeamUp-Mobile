import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/theme";

// 라우트 자체가 없는 경우(app/+not-found.tsx)와, 라우트는 있지만 그 안의 데이터가
// 삭제/존재하지 않는 경우(모집 상세·커뮤니티 글 상세의 404 응답) 둘 다에서 재사용.
// "다시 시도" 버튼이 있는 일반 에러 화면과 다르게, 재시도해도 의미가 없는 상태라
// 목록으로 돌아가는 버튼만 보여줌.
export function NotFoundState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-canvas-soft px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
        <Ionicons name="compass-outline" size={28} color={COLORS.inkSoft} />
      </View>
      <View className="items-center gap-1.5">
        <Text className="text-xl font-bold tracking-tight text-ink">{title}</Text>
        <Text className="text-center text-sm leading-5 text-ink-soft">{description}</Text>
      </View>
      <Button onPress={onAction} className="items-center rounded-lg bg-amber px-5 h-auto py-3 shadow-none">
        <Text className="font-semibold text-ink">{actionLabel}</Text>
      </Button>
    </View>
  );
}
