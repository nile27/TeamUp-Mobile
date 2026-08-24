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
      },
    },
  },
  plugins: [],
};
