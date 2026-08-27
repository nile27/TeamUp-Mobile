import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { avatarTone } from "@/lib/avatar-tone";

// 리스트 아이템에 "테두리+흰배경" 뿐인 밋밋한 카드 대신 시각적 정체성을 주기 위한
// 이니셜 아바타. 이미지 업로드 기능은 없어서(파일럿 스코프) 항상 이니셜만 표시.
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const tone = avatarTone(name);

  return (
    <View
      className={`items-center justify-center rounded-full ${tone.bg}`}
      style={{ width: size, height: size }}
    >
      <Text className={`font-semibold ${tone.text}`} style={{ fontSize: size * 0.42 }}>
        {initial}
      </Text>
    </View>
  );
}
