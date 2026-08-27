import "../global.css";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { queryClient } from "@/lib/query-client";
import { useSession } from "@/features/auth/use-session";
import { supabase } from "@/server/supabase";
import { COLORS } from "@/config/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    // recruit-detail의 alreadyApplied, dashboard 등은 쿼리 키에 사용자 구분이 없어서
    // 로그아웃/다른 계정 로그인 후에도 이전 계정 응답이 캐시로 남아 보이는 문제가 있었음
    // (실기기 테스트에서 발견: A 계정 지원 완료 캐시가 B 계정에서도 "지원 완료"로 보임).
    // 실제 로그인 상태가 바뀌는 시점(로그인/로그아웃)에만 캐시 전체를 비워 방지.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {/* 스플래시가 사라진 직후 첫 화면이 그려지기 전 잠깐 검정 화면이 보이던 것 —
        기본 배경이 안 정해져 있었던 게 원인, 앱 배경색(흰색)으로 고정 */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.canvas } }} />
        {/* React Native Reusables의 Dialog/Select 등 포털 렌더링 컴포넌트가 필요로 함 */}
        <PortalHost />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
