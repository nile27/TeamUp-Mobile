import type { Theme } from "@react-navigation/native";
import { COLORS } from "@/config/theme";

// global.css :root의 CSS 변수와 동일한 값(hsl 문자열)의 JS 버전.
// 네이티브 컴포넌트(아이콘 tint, StatusBar 등) 등 CSS 변수를 직접 못 쓰는 곳에서 사용.
export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(33 15% 15%)",
    card: "hsl(0 0% 100%)",
    popover: "hsl(0 0% 100%)",
    primary: "hsl(33 100% 62%)",
    secondary: "hsl(33 100% 94%)",
    muted: "hsl(210 17% 96%)",
    accent: "hsl(33 100% 94%)",
    destructive: "hsl(0 84% 60%)",
    border: "hsl(216 12% 84%)",
    input: "hsl(216 12% 84%)",
    ring: "hsl(33 100% 62%)",
    radius: "0.5rem",
  },
  // 앱이 userInterfaceStyle: "light" 고정이라 dark는 light와 동일하게 둠.
  dark: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(33 15% 15%)",
    card: "hsl(0 0% 100%)",
    popover: "hsl(0 0% 100%)",
    primary: "hsl(33 100% 62%)",
    secondary: "hsl(33 100% 94%)",
    muted: "hsl(210 17% 96%)",
    accent: "hsl(33 100% 94%)",
    destructive: "hsl(0 84% 60%)",
    border: "hsl(216 12% 84%)",
    input: "hsl(216 12% 84%)",
    ring: "hsl(33 100% 62%)",
    radius: "0.5rem",
  },
};

// React Native Reusables 컴포넌트 + React Navigation이 참조하는 테마.
const LIGHT_THEME: Theme = {
  dark: false,
  colors: {
    primary: COLORS.amber,
    background: COLORS.canvas,
    card: COLORS.canvas,
    text: COLORS.ink,
    border: "#D1D5DB",
    notification: "#EF4444",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: LIGHT_THEME,
  dark: LIGHT_THEME,
};
