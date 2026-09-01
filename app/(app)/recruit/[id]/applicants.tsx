import { useLocalSearchParams } from "expo-router";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { useApplicants } from "@/features/recruit/queries";
import { useUpdateApplicationStatus } from "@/features/recruit/mutations";
import type { ApplicantApplication } from "@/features/recruit/types";

const STATUS_LABEL: Record<ApplicantApplication["status"], string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

const STATUS_BADGE: Record<ApplicantApplication["status"], string> = {
  PENDING: "bg-gray-100",
  ACCEPTED: "bg-emerald-100",
  REJECTED: "bg-red-100",
};

const STATUS_BADGE_TEXT: Record<ApplicantApplication["status"], string> = {
  PENDING: "text-ink-soft",
  ACCEPTED: "text-emerald-700",
  REJECTED: "text-red-700",
};

export default function RecruitApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch, isRefetching } = useApplicants(id);

  if (isLoading) {
    return (
      <View className="flex-1 gap-3 bg-white p-4">
        <View className="h-24 w-full rounded-2xl bg-gray-100" />
        <View className="h-24 w-full rounded-2xl bg-gray-100" />
        <View className="h-24 w-full rounded-2xl bg-gray-100" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
        <Text className="text-ink-soft">지원자 목록을 불러오지 못했어요.</Text>
        <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
          <Text className="font-semibold text-ink">다시 시도</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="gap-4 p-4"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      {data.applications.length === 0 ? (
        <View className="items-center justify-center gap-2 py-16">
          <Text className="text-ink-soft">아직 지원자가 없어요.</Text>
        </View>
      ) : (
        data.applications.map((application) => (
          <ApplicantCard key={application.id} recruitId={id} application={application} />
        ))
      )}
    </ScrollView>
  );
}

function ApplicantCard({
  recruitId,
  application,
}: {
  recruitId: string;
  application: ApplicantApplication;
}) {
  const statusMutation = useUpdateApplicationStatus(recruitId);
  const { applicant } = application;

  return (
    <Card className="gap-3 rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Avatar name={applicant.nickname} size={32} />
          <View>
            <Text className="font-semibold text-ink">{applicant.nickname}</Text>
            <Text className="text-xs text-ink-soft">{applicant.email}</Text>
          </View>
        </View>
        <View className={`rounded-md px-2 py-1 ${STATUS_BADGE[application.status]}`}>
          <Text className={`text-xs font-semibold ${STATUS_BADGE_TEXT[application.status]}`}>
            {STATUS_LABEL[application.status]}
          </Text>
        </View>
      </View>

      {applicant.bio && <Text className="text-sm leading-5 text-ink-soft">{applicant.bio}</Text>}

      {applicant.portfolio && (
        <View className="gap-1 rounded-lg bg-white p-3">
          <Text className="text-xs font-semibold text-ink-soft">포트폴리오 · 경력</Text>
          <Text className="text-sm leading-5 text-ink">{applicant.portfolio}</Text>
        </View>
      )}

      {application.message && (
        <View className="rounded-lg bg-white p-3">
          <Text className="text-sm leading-5 text-ink">{application.message}</Text>
        </View>
      )}

      {application.status === "PENDING" && (
        <View className="flex-row gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 items-center rounded-lg bg-amber shadow-none"
            disabled={statusMutation.isPending}
            onPress={() => statusMutation.mutate({ applicationId: application.id, status: "ACCEPTED" })}
          >
            <Text className="font-semibold text-ink">수락하기</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 items-center rounded-lg shadow-none"
            disabled={statusMutation.isPending}
            onPress={() => statusMutation.mutate({ applicationId: application.id, status: "REJECTED" })}
          >
            <Text className="font-semibold text-ink">거절하기</Text>
          </Button>
        </View>
      )}
    </Card>
  );
}
