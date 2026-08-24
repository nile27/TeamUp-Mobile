import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRecruitDetail } from "@/features/recruit/queries";
import { useApplyToRecruit } from "@/features/recruit/mutations";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";
import { ApiError } from "@/lib/api-client";
import { COLORS } from "@/config/theme";

export default function RecruitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recruit, isLoading, isError, refetch } = useRecruitDetail(id);
  const applyMutation = useApplyToRecruit(id);
  const [applyError, setApplyError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  if (isError || !recruit) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">모집 정보를 불러오지 못했어요.</Text>
        <Pressable onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const applied = recruit.alreadyApplied || applyMutation.isSuccess;

  const handleApply = () => {
    setApplyError(null);
    applyMutation.mutate(undefined, {
      onError: (error) => {
        setApplyError(error instanceof ApiError ? error.message : "지원 처리 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-4 pb-24 gap-4">
        <Text className="text-xs font-medium text-amber-deep">{RECRUIT_TYPE_LABEL[recruit.type]}</Text>
        <Text className="text-xl font-bold text-ink">{recruit.title}</Text>

        <View className="gap-1">
          <Text className="text-sm text-ink-soft">기획 완성도</Text>
          <View className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <View
              className="h-2 rounded-full bg-amber"
              style={{ width: `${recruit.completeness}%` }}
            />
          </View>
        </View>

        <Text className="leading-6 text-ink">{recruit.content}</Text>

        <View className="flex-row flex-wrap gap-1">
          {recruit.techStack.map((stack) => (
            <View key={stack} className="rounded-full bg-amber-soft px-2 py-0.5">
              <Text className="text-xs text-ink">{stack}</Text>
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">모집 역할</Text>
          {recruit.roles.map((role) => (
            <View key={role.id} className="flex-row justify-between rounded-lg bg-gray-50 px-3 py-2">
              <Text className="text-ink">{role.name}</Text>
              <Text className="text-ink-soft">{role.count}명</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
        {applyError && <Text className="mb-2 text-sm text-red-500">{applyError}</Text>}
        <Pressable
          onPress={handleApply}
          disabled={applied || applyMutation.isPending}
          className="items-center rounded-lg bg-amber py-3 disabled:opacity-50"
        >
          <Text className="font-semibold text-ink">
            {applied ? "지원 완료" : applyMutation.isPending ? "지원 중..." : "지원하기"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
