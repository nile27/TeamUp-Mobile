import { API_BASE_URL } from "@/config/env";
import { supabase } from "@/server/supabase";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: await authHeader(),
  });
  return handleResponse<T>(res, "GET", path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "POST", path);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  return handleResponse<T>(res, "DELETE", path);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "PATCH", path);
}

async function handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
  let json: { data?: T; error?: string; fieldErrors?: Record<string, string[]> };
  try {
    json = await res.json();
  } catch (parseError) {
    // 응답 본문이 JSON이 아님(빈 본문 등) — 서버는 처리했는데 클라이언트만 실패로 보이는
    // 케이스가 실제로 있었음(POST /api/applications 500 빈 응답 사례). 원인 추적용 로그.
    console.error(`[API] ${method} ${path} → ${res.status} 응답 본문 파싱 실패`, parseError);
    throw parseError;
  }

  if (!res.ok) {
    console.error(`[API] ${method} ${path} → ${res.status}`, json.error, json.fieldErrors);
    throw new ApiError(json.error ?? "요청 처리 중 오류가 발생했습니다.", res.status, json.fieldErrors);
  }

  return json.data as T;
}
