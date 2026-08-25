import "../global.css";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/lib/query-client";
import { useSession } from "@/features/auth/use-session";
import { supabase } from "@/server/supabase";

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
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
