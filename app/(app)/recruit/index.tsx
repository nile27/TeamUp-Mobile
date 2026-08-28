import { useMemo, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HorizontalCarousel } from "@/components/horizontal-carousel";
import { FilterCarousel } from "@/components/filter-carousel";
import { useRecruitList } from "@/features/recruit/queries";
import { TECH_STACK_OPTIONS } from "@/config/tech-stack";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";
import { COLORS } from "@/config/theme";
import type { Recruit } from "@/features/recruit/types";

const FILTER_CHIPS = TECH_STACK_OPTIONS;

export default function RecruitListScreen() {
  const [stackFilter, setStackFilter] = useState<string[]>([]);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecruitList(stackFilter.length ? stackFilter : undefined);

  // 20개씩 오는 페이지들을 하나의 목록으로 펼침 — 새 페이지를 불러올 때마다
  // 이어붙여서 무한 스크롤처럼 동작(웹이 cursor 기반으로 바꾼 API에 맞춤).
  const recruits = useMemo(() => data?.pages.flatMap((page) => page.recruits) ?? [], [data]);

  const toggleStack = (stack: string) => {
    setStackFilter((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-3">
        <FilterCarousel
          label="기술 스택 필터링"
          options={FILTER_CHIPS}
          selected={stackFilter}
          onToggle={toggleStack}
          onReset={() => setStackFilter([])}
        />
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-24 w-full rounded-xl bg-gray-100" />
          ))}
        </View>
      )}

      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-ink-soft">목록을 불러오지 못했어요.</Text>
          <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
            <Text className="font-semibold text-ink">다시 시도</Text>
          </Button>
        </View>
      )}

      {!isLoading && !isError && recruits.length === 0 && (
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <Text className="text-ink-soft">아직 조건에 맞는 모집이 없어요.</Text>
        </View>
      )}

      {!isLoading && !isError && recruits.length > 0 && (
        <FlatList
          data={recruits}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4 p-4"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => <RecruitCard recruit={item} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator color={COLORS.amber} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const RECRUIT_TYPE_BADGE: Record<Recruit["type"], string> = {
  DEV: "bg-sky-100",
  PLAN: "bg-emerald-100",
};

const RECRUIT_TYPE_BADGE_TEXT: Record<Recruit["type"], string> = {
  DEV: "text-sky-700",
  PLAN: "text-emerald-700",
};

function RecruitCard({ recruit }: { recruit: Recruit }) {
  return (
    <Pressable onPress={() => router.push(`/(app)/recruit/${recruit.id}`)}>
      {/* 테두리+흰배경 뿐인 카드 대신, 옅은 배경 톤으로만 카드 경계를 표현 */}
      <Card className="gap-2 rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
        <View
          className={`self-start rounded-md px-2 py-1 ${RECRUIT_TYPE_BADGE[recruit.type]}`}
        >
          <Text className={`text-xs font-semibold ${RECRUIT_TYPE_BADGE_TEXT[recruit.type]}`}>
            {RECRUIT_TYPE_LABEL[recruit.type]}
          </Text>
        </View>
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {recruit.title}
        </Text>
        <Text className="text-sm text-ink-soft" numberOfLines={2}>
          {recruit.content}
        </Text>
        <HorizontalCarousel contentContainerClassName="gap-1.5 pr-2" fadeColor="#F9FAFB">
          {recruit.techStack.map((stack) => (
            <View key={stack} className="rounded-full bg-amber-soft px-2 py-0.5">
              <Text className="text-xs text-ink">{stack}</Text>
            </View>
          ))}
        </HorizontalCarousel>
      </Card>
    </Pressable>
  );
}
