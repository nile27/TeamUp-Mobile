/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // 기본값(media)로 두면 NativeWind가 웹에서 다크모드 플래그를 읽는 초기화 코드가
  // 부팅 시점에 colorScheme.set()을 호출하다 "media"일 때 throw하는 버그가 있음.
  // 앱은 app.json userInterfaceStyle: "light"로 라이트 고정이라 class 전략으로 회피.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: "#FFA940",
          deep: "#F08C00",
          soft: "#FFF4E3",
        },
        ink: {
          DEFAULT: "#2B2620",
          soft: "#6B6257",
        },
        canvas: "#FFFFFF",
        // minimalist-ui 스킬 파일럿: 순백 대신 아주 옅은 웜 오프화이트 캔버스.
        "canvas-soft": "#FBFBFA",
        // React Native Reusables(shadcn RN 포트) 컴포넌트가 쓰는 시맨틱 토큰.
        // 값은 global.css :root의 CSS 변수(amber/ink 브랜드 팔레트 매핑)를 참조.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
