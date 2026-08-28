import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/theme";

// 웹 랜딩(src/components/landing/*)의 핵심 카피만 가져와서 앱 안에서 그린 화면.
// 원래는 로그인 화면에서 웹 랜딩으로 바로 링크(Linking.openURL)를 걸어뒀는데,
// 삼성 인터넷이 color-scheme 메타 태그를 무시하고 강제로 다크모드를 씌워서
// (웹 쪽에서 CSS로 막을 방법이 없음을 확인함) 우리 자체 라이트 고정 화면으로 대체.
// 전체 마케팅 사이트를 복제하지 않고 "TeamUp이 뭔지" 핵심만 압축.
const PROBLEMS = [
  {
    icon: "bulb-outline" as const,
    title: "아이디어는 많은데 개발을 못해요",
    desc: "혼자서 앱을 만들 수 없어서 아이디어 노트에만 묵혀두고 계신가요?",
  },
  {
    icon: "people-outline" as const,
    title: "개발자 모임에 가면 소외감을 느껴요",
    desc: "테크 위주의 네트워킹에서는 기획자가 설 자리가 없으셨죠?",
  },
  {
    icon: "rocket-outline" as const,
    title: "실전 포트폴리오가 필요해요",
    desc: "강의 과제가 아닌, 실제로 작동하는 프로덕트를 만들어보고 싶으신가요?",
  },
];

const STEPS = [
  { num: 1, title: "아이디어 등록", desc: "풀고 싶은 문제와 솔루션을 간략히 정리해 팀원을 모집하세요." },
  { num: 2, title: "개발자 매칭", desc: "내 아이디어에 공감하는 개발자가 합류하여 팀이 결성됩니다." },
  { num: 3, title: "프로젝트 진행", desc: "기획자로서 요구사항을 정의하고 개발 과정의 방향을 잡습니다." },
  { num: 4, title: "런칭 및 포트폴리오", desc: "실제 서비스를 런칭하고 나의 기여도를 증명하는 포트폴리오를 얻습니다." },
];

const ROLES = [
  {
    icon: "bulb-outline" as const,
    title: "아이디어 제안자",
    desc: "해결하고 싶은 문제가 있다면 누구나 리더가 될 수 있습니다. 아이디어를 등록하고 팀을 구성하세요.",
  },
  {
    icon: "create-outline" as const,
    title: "기획/운영",
    desc: "다른 사람의 아이디어에 공감한다면 기획자로 합류하세요. 요구사항 정의와 프로젝트 매니징을 담당합니다.",
  },
  {
    icon: "code-slash-outline" as const,
    title: "개발자 (예정)",
    desc: "추후 업데이트될 기능입니다. 아이디어를 실현할 기술 파트너로 합류하여 개발 경험을 쌓으세요.",
  },
];

export default function LandingScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-10">
        <View className="flex-row items-center gap-2 px-4 pb-2 pt-6">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-60">
            <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Hero */}
        <View className="gap-5 bg-amber-soft px-6 pb-12 pt-4">
          <Text className="text-4xl font-extrabold leading-[1.15] tracking-tight text-ink">
            개발 못 해도,{"\n"}기획자로 참여하세요
          </Text>
          <Text className="text-base leading-6 text-ink-soft">
            아이디어만 있어도 괜찮습니다. 함께 팀을 이뤄 프로젝트를 현실로 만드세요.
          </Text>
          <View className="mt-2 flex-row gap-3">
            <Button
              className="flex-1 items-center rounded-lg bg-amber py-3 shadow-sm shadow-amber-deep/30 active:opacity-80"
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text className="font-semibold text-ink">시작하기</Text>
            </Button>
            <Button
              variant="outline"
              className="flex-1 items-center rounded-lg border-ink py-3 shadow-none active:opacity-70"
              onPress={() => router.replace("/(app)/recruit")}
            >
              <Text className="font-semibold text-ink">둘러보기</Text>
            </Button>
          </View>
        </View>

        {/* Why TeamUp */}
        <View className="gap-7 px-6 py-12">
          <View className="gap-1.5">
            <Text className="text-xs font-bold uppercase tracking-wide text-amber-deep">Why TeamUp?</Text>
            <Text className="text-2xl font-extrabold tracking-tight text-ink">이런 고민 해보신 적 있나요?</Text>
          </View>
          <View className="gap-6">
            {PROBLEMS.map((p) => (
              <View key={p.title} className="flex-row gap-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-soft">
                  <Ionicons name={p.icon} size={20} color={COLORS.amberDeep} />
                </View>
                <View className="flex-1 gap-1 pt-1">
                  <Text className="font-bold text-ink">{p.title}</Text>
                  <Text className="text-sm leading-5 text-ink-soft">{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View className="gap-7 bg-gray-50 px-6 py-12">
          <View className="gap-1.5">
            <Text className="text-xs font-bold uppercase tracking-wide text-amber-deep">How it works</Text>
            <Text className="text-2xl font-extrabold tracking-tight text-ink">기획부터 런칭까지, 이렇게 진행됩니다</Text>
          </View>
          <View className="gap-6">
            {STEPS.map((step) => (
              <View key={step.num} className="flex-row gap-4">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-amber shadow-sm shadow-amber-deep/30">
                  <Text className="font-extrabold text-ink">{step.num}</Text>
                </View>
                <View className="flex-1 gap-1 pt-1">
                  <Text className="font-bold text-ink">{step.title}</Text>
                  <Text className="text-sm leading-5 text-ink-soft">{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Participation */}
        <View className="gap-7 px-6 py-12">
          <View className="gap-1.5">
            <Text className="text-xs font-bold uppercase tracking-wide text-amber-deep">Participation</Text>
            <Text className="text-2xl font-extrabold tracking-tight text-ink">어떤 역할로 참여할 수 있나요?</Text>
          </View>
          <View className="gap-4">
            {ROLES.map((role) => (
              <View
                key={role.title}
                className="gap-2 rounded-2xl bg-gray-50 p-5 shadow-sm shadow-amber-deep/10"
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-soft">
                  <Ionicons name={role.icon} size={20} color={COLORS.amberDeep} />
                </View>
                <Text className="font-bold text-ink">{role.title}</Text>
                <Text className="text-sm leading-5 text-ink-soft">{role.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA */}
        <View className="gap-3 px-6 pt-8 text-center">
          <Text className="text-center text-2xl font-extrabold tracking-tight text-ink">
            지금 바로 당신의 아이디어를{"\n"}팀과 공유하세요
          </Text>
          <Text className="text-center text-sm text-ink-soft">
            망설이지 마세요. 완벽한 계획보다 빠른 실행이 프로젝트의 첫 걸음입니다.
          </Text>
          <Button
            className="mt-2 items-center rounded-lg bg-amber py-3 shadow-sm shadow-amber-deep/30 active:opacity-80"
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text className="font-semibold text-ink">프로젝트 시작하기</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
