import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { HorizontalCarousel } from "@/components/horizontal-carousel";
import { useSession } from "@/features/auth/use-session";
import { useRecruitDetail } from "@/features/recruit/queries";
import { useApplyToRecruit, useDeleteRecruit } from "@/features/recruit/mutations";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";
import { ApiError } from "@/lib/api-client";

const RECRUIT_TYPE_BADGE: Record<"DEV" | "PLAN", string> = {
  DEV: "bg-sky-100",
  PLAN: "bg-emerald-100",
};

const RECRUIT_TYPE_BADGE_TEXT: Record<"DEV" | "PLAN", string> = {
  DEV: "text-sky-700",
  PLAN: "text-emerald-700",
};

export default function RecruitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data: recruit, isLoading, isError, refetch } = useRecruitDetail(id);
  const applyMutation = useApplyToRecruit(id);
  const deleteMutation = useDeleteRecruit();
  const [applyError, setApplyError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 gap-4 bg-canvas-soft p-4">
        <View className="h-6 w-20 rounded-md bg-gray-100" />
        <View className="h-8 w-3/4 rounded-md bg-gray-100" />
        <View className="h-4 w-1/2 rounded-md bg-gray-100" />
        <View className="h-24 w-full rounded-xl bg-gray-100" />
        <View className="h-24 w-full rounded-xl bg-gray-100" />
      </View>
    );
  }

  if (isError || !recruit) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-canvas-soft px-6">
        <Text className="text-ink-soft">모집 정보를 불러오지 못했어요.</Text>
        <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Button>
      </View>
    );
  }

  const applied = recruit.alreadyApplied || applyMutation.isSuccess;
  const isAuthor = !!session && recruit.author?.id === session.user.id;

  const handleDelete = () => {
    Alert.alert("이 모집글을 삭제할까요?", "지원 내역을 포함해 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setDeleteError(null);
          deleteMutation.mutate(id, {
            onSuccess: () => router.back(),
            onError: (error) => {
              setDeleteError(error instanceof ApiError ? error.message : "삭제 중 오류가 발생했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleApply = () => {
    if (isAuthor) {
      router.push(`/(app)/recruit/${id}/applicants`);
      return;
    }
    if (!session) {
      router.push("/(auth)/login");
      return;
    }
    setApplyError(null);
    applyMutation.mutate(undefined, {
      onError: (error) => {
        setApplyError(error instanceof ApiError ? error.message : "지원 처리 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas-soft">
      <ScrollView contentContainerClassName="p-4 pb-24 gap-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-2">
            <View className={`self-start rounded-md px-2 py-1 ${RECRUIT_TYPE_BADGE[recruit.type]}`}>
              <Text className={`text-xs font-semibold ${RECRUIT_TYPE_BADGE_TEXT[recruit.type]}`}>
                {RECRUIT_TYPE_LABEL[recruit.type]}
              </Text>
            </View>
            <Text className="text-2xl font-extrabold tracking-tight text-ink">{recruit.title}</Text>
          </View>
          {isAuthor && (
            <Button
              variant="destructive"
              size="sm"
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Text>삭제</Text>
            </Button>
          )}
        </View>
        {deleteError && <Text className="text-sm text-red-500">{deleteError}</Text>}

        {recruit.author && (
          <View className="flex-row items-center gap-2">
            <Avatar name={recruit.author.nickname} size={28} />
            <Text className="text-sm text-ink-soft">
              {recruit.author.nickname} · {new Date(recruit.createdAt).toLocaleDateString("ko-KR")}
            </Text>
          </View>
        )}

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

        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">기술 스택</Text>
          <HorizontalCarousel contentContainerClassName="gap-1.5 pr-4" fadeColor="#FBFBFA">
            {recruit.techStack.map((stack) => (
              <View key={stack} className="rounded-full border border-gray-200 bg-white px-3 py-1.5">
                <Text className="text-xs text-ink-soft">{stack}</Text>
              </View>
            ))}
          </HorizontalCarousel>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">모집 역할</Text>
          {recruit.roles.map((role) => (
            <View
              key={role.id}
              className="flex-row justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <Text className="text-ink">{role.name}</Text>
              <Text className="text-ink-soft">{role.count}명</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        {applyError && <Text className="mb-2 text-sm text-red-500">{applyError}</Text>}
        <Button
          onPress={handleApply}
          disabled={!isAuthor && (applied || applyMutation.isPending)}
          className="items-center rounded-lg bg-amber py-3 shadow-none disabled:opacity-50"
        >
          <Text className="font-semibold text-ink">
            {isAuthor
              ? `지원자 확인하기 (${recruit._count.applications})`
              : applied
                ? "지원 완료"
                : applyMutation.isPending
                  ? "지원 중..."
                  : session
                    ? "지원하기"
                    : "로그인하고 지원하기"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
