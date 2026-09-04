import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

// 로딩 상태에서 회색 박스가 그냥 멈춰있으면 "로딩 중"인지 "멈춘 화면"인지
// 구분이 안 됨 — 옅게 숨쉬듯 opacity가 오르내리는 펄스 애니메이션을 줘서
// 실제로 뭔가 불러오는 중이라는 걸 시각적으로 알려줌.
export function Skeleton({ className }: { className: string }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View className={`bg-gray-100 ${className}`} style={style} />;
}
