# ARCHITECTURE-mobile.md — 모바일 기술 아키텍처

TeamUp 모바일(Expo/RN) 기술 구조. "어떻게 만드는가". 서비스 정의는 `PRD.md`, 파일럿 범위는 `rn-pilot-plan.md` 참고.

> 웹(`~/Desktop/TeamUp`)의 `ARCHITECTURE.md`는 Next.js 풀스택(서버 우선) 기준이라 **RN에 그대로 적용되지 않는다.** 이 문서가 모바일 기준.

---

## 1. 전체 구조

```
[모바일 클라이언트]  Expo / React Native (이 레포)
        │
        │  fetch  Authorization: Bearer <supabase token>
        ↓
[Next.js 웹 (~/Desktop/TeamUp)]
  app/api/* (얇은 REST) ──→ features/*/queries·actions ──→ lib ──→ Prisma ──→ Supabase
        │
[Supabase]  PostgreSQL(DB) + Auth(인증)   ← 웹과 RN이 같은 프로젝트 공유
```

- RN은 **백엔드를 새로 만들지 않는다.** 기존 웹의 `/api/*` REST를 호출하는 클라이언트.
- 인증도 같은 Supabase 프로젝트 → 웹에서 만든 계정으로 앱 로그인 가능, 앱에서 한 지원이 웹 DB·대시보드에 반영.
- (Spring 전환은 파일럿 전제 아님. 나중에 백엔드가 바뀌어도 `api-contract.md` 계약만 지키면 RN은 영향 최소.)

---

## 2. 폴더 구조 (Feature 기반 · 콜로케이션)

`app/`은 Expo Router 라우팅 껍데기(얇게), 로직·컴포넌트는 `src/features/`에. 상세 트리는 `rn-pilot-plan.md` 2장.

```
TeamUp-mobile/
├─ app/                       # Expo Router (파일 기반 라우팅). 얇게.
│  ├─ _layout.tsx             # QueryClientProvider + Supabase 세션 컨텍스트 + 테마
│  ├─ index.tsx               # 세션 확인 → (app) 또는 (auth) 리다이렉트
│  ├─ (auth)/                 # 라우트 그룹 (URL 세그먼트 안 만듦)
│  │  ├─ _layout.tsx
│  │  ├─ login.tsx
│  │  └─ signup.tsx
│  └─ (app)/
│     ├─ _layout.tsx          # 인증 가드 + 하단 탭(모집/대시보드)
│     ├─ recruit/index.tsx    # 모집 목록
│     ├─ recruit/[id].tsx     # 모집 상세
│     └─ dashboard.tsx        # 대시보드
├─ src/
│  ├─ features/               # recruit / auth / dashboard
│  │  └─ recruit/
│  │     ├─ api.ts            # fetch /api/* (네트워크 호출만)
│  │     ├─ queries.ts        # useQuery 훅 (조회)
│  │     ├─ mutations.ts      # useMutation (지원·생성 등 변경)
│  │     ├─ components/       # RecruitCard 등 (RN)
│  │     └─ types.ts
│  ├─ components/ui/          # React Native Reusables (shadcn RN 포트)
│  ├─ lib/                    # ← 웹 src/lib 복붙 (completeness 등 순수 함수)
│  ├─ schema/                 # ← 웹 features/*/schema.ts 복붙 (zod)
│  ├─ server/supabase.ts      # secure-store 기반 세션 클라이언트
│  └─ config/                 # env, API base URL, 디자인 토큰
├─ tailwind.config.js global.css app.json eas.json metro.config.js
```

---

## 3. 웹 ↔ RN 매핑 (1:1)

| 웹 (Next.js) | RN (Expo) |
|---|---|
| `page.tsx`에서 `await 조회` (서버 컴포넌트) | 라우트 컴포넌트 + `features/*/queries.ts`(useQuery 훅) |
| `actions.ts` (Server Action, 변경) | `api.ts`(fetch `/api/*`) + `mutations.ts`(useMutation) |
| 필터 → `searchParams`(URL) | 필터 → 컴포넌트 상태 + React Query key |
| 쿠키 세션 (자동) | `Authorization: Bearer` 헤더 (secure-store 토큰) |
| `lib/completeness.ts`, `features/*/schema.ts` | **복붙** → `src/lib`, `src/schema` (공유 패키지 X) |

**핵심**: 비즈니스 로직(검증·계산·DB)은 웹 `/api/*`에만. RN은 호출·표시만. `completeness`만 순수 함수라 UI 즉시 반영용으로 복붙.

---

## 4. 렌더링/데이터 전략

- **모든 데이터 화면 = 클라이언트 렌더 + React Query.** 웹의 SSG/SSR/ISR 구분은 RN에 없음.
- 목록·상세: `useQuery`. 로딩(스켈레톤)/에러(재시도)/빈 상태 3종 필수(`STATES.md`).
- 지원·작성 등 변경: `useMutation`. 낙관적 업데이트 권장, 실패 시 롤백.
- 캐시: 화면 재진입 시 stale-while-revalidate 감각으로 즉시 이전 데이터 → 백그라운드 갱신.

---

## 5. 인증 흐름

1. `(auth)/login`·`signup`에서 Supabase Auth SDK로 이메일(가능하면 구글/카카오) 로그인/가입.
2. 세션 토큰을 **expo-secure-store**에 저장(`server/supabase.ts`).
3. `app/index.tsx`가 세션 유무로 `(app)` 또는 `(auth)` 리다이렉트. `(app)/_layout.tsx`가 인증 가드.
4. API 호출 시 저장된 access token을 `Authorization: Bearer`로 전송 → 웹 `/api/*`가 검증(`api-contract.md`).
5. 회원가입 직후 Prisma User 프로필은 `POST /api/profile`로 생성(웹 signup 2단계와 동일).

---

## 6. 테스트 / 배포

- 테스트: Jest + jest-expo + RNTL(유닛), Maestro(E2E 척추 여정). 상세 `rn-pilot-plan.md` 3장.
- 배포: EAS internal 빌드(Android APK) + `eas update` OTA. Vercel 못 씀. 상세 `rn-pilot-plan.md` 4장.
- 실기기: Expo Go(SDK 54)로는 못 엶 → development build 필요.
