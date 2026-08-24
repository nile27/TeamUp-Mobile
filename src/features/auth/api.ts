import { supabase } from "@/server/supabase";
import { apiPost } from "@/lib/api-client";

export async function loginWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signupWithPassword(email: string, password: string, nickname: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Supabase는 이메일 열거 공격 방지를 위해 이미 가입된 이메일이어도 에러를 던지지 않고
  // 세션 없는 "성공"처럼 응답함 — 대신 user.identities가 빈 배열로 옴(공식 문서 권장 판별법).
  if (data.user && data.user.identities?.length === 0) {
    throw new Error("already registered");
  }

  // 이메일 인증이 필요한 프로젝트 설정이면 세션이 없을 수 있음 — 그 경우 프로필 생성은
  // 최초 로그인 시점으로 미룬다(토큰이 있어야 /api/profile 호출 가능).
  if (data.session) {
    await apiPost("/api/profile", { nickname });
  }

  return { needsEmailConfirmation: !data.session };
}

export async function ensureProfile(nickname: string) {
  return apiPost("/api/profile", { nickname });
}
