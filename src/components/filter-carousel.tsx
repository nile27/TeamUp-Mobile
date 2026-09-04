import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/config/theme";

// minimalist-ui 스킬(웜 모노크롬 + 절제된 파스텔) 파일럿 적용:
// 색으로 꽉 채운 큰 박스(bg-amber-soft) 대신, 얇은 테두리 하나로만 경계를 표현하는
// "문서형" 톤으로 전환. 그림자는 색조 강조 대신 흐릿하게 거의 안 보이는 정도로,
// 활성 칩도 진한 단색 채움 대신 옅은 파스텔 배경 + 테두리로 절제.
export function FilterCarousel({
  label,
  options,
  selected,
  onToggle,
  onReset,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  onReset: () => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);

  const scrollBy = (dx: number) => {
    const next = Math.max(0, scrollX.current + dx);
    scrollRef.current?.scrollTo({ x: next, animated: true });
  };

  return (
    <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</Text>

        <View className="flex-row items-center gap-1.5">
          {selected.length > 0 && (
            <Pressable
              onPress={onReset}
              className="h-7 flex-row items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 active:opacity-60"
            >
              <Ionicons name="refresh" size={12} color={COLORS.inkSoft} />
              <Text className="text-xs font-medium text-ink-soft">초기화</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => scrollBy(-140)}
            className="h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white active:opacity-60"
          >
            <Ionicons name="chevron-back" size={14} color={COLORS.ink} />
          </Pressable>
          <Pressable
            onPress={() => scrollBy(140)}
            className="h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white active:opacity-60"
          >
            <Ionicons name="chevron-forward" size={14} color={COLORS.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollX.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        contentContainerClassName="flex-row gap-2 px-1 py-0.5"
      >
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(option)}
              className={`rounded-full border px-3.5 py-1.5 active:opacity-60 ${
                active ? "border-amber-deep/30 bg-amber-soft" : "border-gray-200 bg-white"
              }`}
            >
              <Text className={active ? "font-medium text-amber-deep" : "text-ink-soft"}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
