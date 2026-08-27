import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/config/theme";

// redesign-existing-projects 스킬 감사 기준으로 다시 다듬음:
// - 칩/네비 버튼에 색조 맞춘(tinted) 그림자 추가 — 순수 flat이라 깊이감이 없던 문제.
// - 모든 Pressable에 눌림 피드백(active:opacity) 추가 — 눌러도 반응 없던 문제.
// - 네비 버튼과 초기화 버튼을 시각적으로 한 그룹처럼 묶음(같은 크기·톤의 원형 버튼).
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
    <View className="gap-3 rounded-2xl bg-amber-soft p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-amber" />
          <Text className="text-sm font-semibold text-amber-deep">{label}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          {selected.length > 0 && (
            <Pressable
              onPress={onReset}
              className="h-7 flex-row items-center gap-1 rounded-full bg-white px-2.5 shadow-sm shadow-amber-deep/20 active:opacity-70"
            >
              <Ionicons name="refresh" size={12} color={COLORS.amberDeep} />
              <Text className="text-xs font-semibold text-amber-deep">초기화</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => scrollBy(-140)}
            className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm shadow-amber-deep/20 active:opacity-70"
          >
            <Ionicons name="chevron-back" size={14} color={COLORS.amberDeep} />
          </Pressable>
          <Pressable
            onPress={() => scrollBy(140)}
            className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm shadow-amber-deep/20 active:opacity-70"
          >
            <Ionicons name="chevron-forward" size={14} color={COLORS.amberDeep} />
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
              className={`rounded-full px-3.5 py-1.5 active:opacity-70 ${
                active ? "bg-amber shadow-sm shadow-amber-deep/30" : "bg-white shadow-sm shadow-amber-deep/10"
              }`}
            >
              <Text className={active ? "font-semibold text-ink" : "text-ink-soft"}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
