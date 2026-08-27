import type { ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps } from "react-native";

// 그냥 가로 ScrollView만 쓰면 스크롤이 되긴 해도 "더 있다"는 게 눈에 안 보여서
// UX적으로 캐러셀인지 티가 안 남 — 양쪽 끝에 배경색 페이드를 얹어서 암시함.
// (화살표는 여기 얹으면 콘텐츠 위에 겹쳐 보여서 뺐음 — 라벨/컨트롤이 필요한
// 캐러셀은 FilterCarousel처럼 별도 헤더 영역에 둘 것.)
// 반투명 View를 여러 겹 겹쳐서 그라디언트처럼 보이게 하는 순수 JS/스타일 방식
// (expo-linear-gradient는 네이티브 모듈이라 dev-client 재빌드 없이는 못 씀).
const FADE_STEPS = [0.85, 0.6, 0.35, 0.15];

export function HorizontalCarousel({
  children,
  contentContainerClassName,
  fadeColor = "#ffffff",
  ...props
}: ScrollViewProps & { children: ReactNode; fadeColor?: string }) {
  return (
    <View className="relative">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={contentContainerClassName}
        {...props}
      >
        {children}
      </ScrollView>

      <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16, flexDirection: "row" }}>
        {FADE_STEPS.slice()
          .reverse()
          .map((opacity, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: fadeColor, opacity }} />
          ))}
      </View>

      <View pointerEvents="none" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 16, flexDirection: "row" }}>
        {FADE_STEPS.map((opacity, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: fadeColor, opacity }} />
        ))}
      </View>
    </View>
  );
}
