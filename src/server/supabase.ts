import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/config/env";

// RN엔 쿠키가 없어 세션을 expo-secure-store에 저장.
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// expo-secure-store엔 네이티브 모듈이 없어 웹에선 호출 즉시 크래시함(화면 미리보기 전용이라
// 세션 영속은 필요 없음) — 메모리 어댑터로 대체.
const memoryStore = new Map<string, string>();
const MemoryStorageAdapter = {
  getItem: async (key: string) => memoryStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStore.delete(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: Platform.OS === "web" ? MemoryStorageAdapter : SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// autoRefreshToken의 타이머는 앱이 포그라운드에 있을 때만 정상적으로 도는데,
// RN은 웹과 달리 앱이 백그라운드로 가면 이 타이머가 멈춰버림 — Supabase 공식
// 권장 패턴대로 AppState를 직접 감시해서 포그라운드로 돌아올 때마다 명시적으로
// startAutoRefresh를 다시 걸어줘야 함. 이게 없으면 앱을 오래 백그라운드에
// 뒀다가 열었을 때 세션은 남아있지만(getSession()이 만료된 값을 그대로 반환)
// access token이 만료돼서 API 호출이 401로 실패하는데도 로그인 화면으로는
// 안 튕기는 상태가 됨(증상: "로그인 안 했는데 로그인된 것처럼 보이다가 401").
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
