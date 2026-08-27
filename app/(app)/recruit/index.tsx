import { useState } from "react";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecruitList } from "@/features/recruit/queries";
import { TECH_STACK_OPTIONS } from "@/config/tech-stack";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";
import type { Recruit } from "@/features/recruit/types";

const FILTER_CHIPS = TECH_STACK_OPTIONS.slice(0, 8);

export default function RecruitListScreen() {
  const [stackFilter, setStackFilter] = useState<string[]>([]);
  const { data, isLoading, isError, refetch, isRefetching } = useRecruitList(
    stackFilter.length ? stackFilter : undefined
  );

  const toggleStack = (stack: string) => {
    setStackFilter((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
        {FILTER_CHIPS.map((stack) => {
          const active = stackFilter.includes(stack);
          return (
            <Pressable
              key={stack}
              onPress={() => toggleStack(stack)}
              className={`rounded-full border px-3 py-1.5 ${
                active ? "border-amber bg-amber-soft" : "border-gray-300"
              }`}
            >
              <Text className={active ? "text-ink" : "text-ink-soft"}>{stack}</Text>
            </Pressable>
          );
        })}
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

      {!isLoading && !isError && data && data.length === 0 && (
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <Text className="text-ink-soft">아직 조건에 맞는 모집이 없어요.</Text>
        </View>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => <RecruitCard recruit={item} />}
        />
      )}
    </View>
  );
}

function RecruitCard({ recruit }: { recruit: Recruit }) {
  return (
    <Pressable onPress={() => router.push(`/(app)/recruit/${recruit.id}`)}>
      <Card className="gap-0 rounded-xl border border-gray-100 p-4 shadow-none">
        <Text className="mb-1 text-xs font-medium text-amber-deep">
          {RECRUIT_TYPE_LABEL[recruit.type]}
        </Text>
        <Text className="mb-1 text-base font-semibold text-ink" numberOfLines={1}>
          {recruit.title}
        </Text>
        <Text className="mb-2 text-sm text-ink-soft" numberOfLines={2}>
          {recruit.content}
        </Text>
        <View className="flex-row flex-wrap gap-1">
          {recruit.techStack.slice(0, 4).map((stack) => (
            <View key={stack} className="rounded-full bg-amber-soft px-2 py-0.5">
              <Text className="text-xs text-ink">{stack}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}
