import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
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
