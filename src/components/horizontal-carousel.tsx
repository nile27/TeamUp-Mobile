import { useState, type ReactNode } from "react";
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewProps } from "react-native";

// 그냥 가로 ScrollView만 쓰면 스크롤이 되긴 해도 "더 있다"는 게 눈에 안 보여서
// UX적으로 캐러셀인지 티가 안 남 — 양쪽 끝에 배경색 페이드를 얹어서 암시함.
// (화살표는 여기 얹으면 콘텐츠 위에 겹쳐 보여서 뺐음 — 라벨/컨트롤이 필요한
// 캐러셀은 FilterCarousel처럼 별도 헤더 영역에 둘 것.)
// 반투명 View를 여러 겹 겹쳐서 그라디언트처럼 보이게 하는 순수 JS/스타일 방식
// (expo-linear-gradient는 네이티브 모듈이라 dev-client 재빌드 없이는 못 씀).
//
// 페이드를 스크롤 위치와 무관하게 항상 띄워뒀더니, 맨 처음/맨 끝이라 가릴 게
// 없을 때도 첫 번째·마지막 칩 글자가 페이드에 덮여 잘려 보이는 문제가 있었음
// (실기기에서 발견) — 스크롤 오프셋을 추적해서 실제로 가려질 콘텐츠가 있을
// 때만 해당 쪽 페이드를 보여주도록 수정.
const FADE_STEPS = [0.85, 0.6, 0.35, 0.15];
const EDGE_THRESHOLD = 4;

export function HorizontalCarousel({
  children,
  contentContainerClassName,
  fadeColor = "#ffffff",
  onScroll,
  onContentSizeChange,
  onLayout,
  ...props
}: ScrollViewProps & { children: ReactNode; fadeColor?: string }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateFromOffset = (offsetX: number, cWidth = containerWidth, tWidth = contentWidth) => {
    setCanScrollLeft(offsetX > EDGE_THRESHOLD);
    setCanScrollRight(offsetX + cWidth < tWidth - EDGE_THRESHOLD);
  };

  return (
    <View className="relative">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={contentContainerClassName}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          updateFromOffset(e.nativeEvent.contentOffset.x);
          onScroll?.(e);
        }}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => {
          setContentWidth(w);
          updateFromOffset(0, containerWidth, w);
          onContentSizeChange?.(w, h);
        }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setContainerWidth(w);
          updateFromOffset(0, w, contentWidth);
          onLayout?.(e);
        }}
        {...props}
      >
        {children}
      </ScrollView>

      {canScrollLeft && (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16, flexDirection: "row" }}>
          {FADE_STEPS.slice()
            .reverse()
            .map((opacity, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: fadeColor, opacity }} />
            ))}
        </View>
      )}

      {canScrollRight && (
        <View pointerEvents="none" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 16, flexDirection: "row" }}>
          {FADE_STEPS.map((opacity, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: fadeColor, opacity }} />
          ))}
        </View>
      )}
    </View>
  );
}
