# AGENTS.md — TeamUp 모바일 (Expo / React Native)

TeamUp 모바일 앱에서 코드를 작성할 때 반드시 따라야 할 핵심 규칙. 상세 내용은 `docs/`의 개별 문서 참고.
(웹 프로젝트는 `~/Desktop/TeamUp` 별도 레포. 이 레포는 그 웹 API를 소비하는 모바일 클라이언트다.)

---

## ⚠️ Expo 버전 주의 (가장 먼저 읽을 것)

- **Expo SDK 57 / React Native 0.86 / New Architecture(newArchEnabled) 사용.** 최신 버전대라 예전 자료가 안 맞는 경우 많음.
- 코드 작성 전 **버전 고정 공식 문서** 확인: https://docs.expo.dev/versions/v57.0.0/
- **폰의 Expo Go(스토어 최신)는 SDK 54까지만 지원** → 이 프로젝트(57)는 Expo Go로 못 엶("incompatible" 에러). 실기기 테스트는 **development build(EAS, Android APK)** 로 해야 함. 웹 미리보기(`npx expo start --web`)는 화면 확인용으로만.
- 패키지 설치는 `npm install`이 아니라 **`npx expo install <pkg>`** 로 (SDK 호환 버전 자동 선택).

---

## 📍 진행 상태 (작업 시 최신화할 것)

> 도구/세션을 옮겨도 여기만 보면 이어서 진행 가능하도록, 단계 끝날 때마다 갱신.

- [x] Expo 앱 스캐폴딩 — expo-router, NativeWind, Supabase SDK, React Query, RHF+zod, secure-store 설치. `app/` 라우트 그룹((auth)/(app)) + `src/` 골격 배치.
- [ ] 웹 REST API(`/api/*`) 신설 확인 — RN이 호출할 엔드포인트(`api-contract.md` 기준)가 웹에 실제로 있는지 점검. 없으면 웹 레포에서 먼저.
- [ ] 척추 화면 구현 — 로그인/회원가입 → 모집 목록 → 모집 상세 → 지원 흐름 (`rn-pilot-plan.md` Tier 0)
- [ ] 실기기 테스트 — Android development build(EAS internal APK)로 여정 완결 확인
- [ ] 테스트 — Jest(completeness·스키마 유닛) + Maestro(척추 여정 1개)
- [ ] EAS internal 빌드 + `eas update` OTA로 시연 가능화

> 목표·완료 기준: `docs/rn-pilot-plan.md` 5장. 이건 실서비스 대체가 아니라 **RN 역량 확장 파일럿**(포트폴리오).

---

## 프로젝트 한 줄 요약

"개발 못 해도 기획자로 사이드프로젝트에 참여하는" 팀원 매칭 플랫폼의 **모바일 클라이언트**. 서비스 정의·기능은 웹과 동일(`docs/PRD.md`). 이 앱은 핵심 여정 하나(개발자가 프로젝트 찾아 지원)를 끝까지 완결시키는 파일럿.

---

## 기술 스택

- **런타임**: Expo SDK 57 + React Native 0.86 (New Architecture)
- **라우팅**: Expo Router (파일 기반, `app/`)
- **UI**: NativeWind(RN용 Tailwind) + React Native Reusables(shadcn RN 포트)
- **데이터**: @tanstack/react-query (읽기 훅 + mutation). ❌ 서버 컴포넌트/Server Action 없음(웹과 다름)
- **인증**: @supabase/supabase-js + expo-secure-store(세션 저장). 웹과 **같은 Supabase 프로젝트** → 계정·데이터 공유
- **폼/검증**: react-hook-form + zod (스키마는 웹에서 복붙 공유)
- **배포**: Expo EAS (Vercel 못 씀). internal 배포 + `eas update` OTA

> 백엔드는 **기존 웹(Next.js/Prisma/Supabase) 재사용**. RN은 웹의 `/api/*` REST를 호출만. 로직 중복 구현 금지.

---

## 핵심 아키텍처 원칙

> ⚠️ **웹의 원칙을 그대로 가져오지 말 것.** 웹은 "서버 우선(Server-first)·상태는 URL"이지만 RN은 클라이언트 앱이라 다르다. 아래는 RN용 재정의.

### 1. 데이터는 React Query로 (서버 컴포넌트 없음)
- 조회는 `features/*/queries.ts`의 **useQuery 훅**으로. 변경은 `mutations.ts`의 **useMutation**.
- 웹 `page.tsx`의 `await 조회` → RN에선 라우트 컴포넌트 + React Query 훅.
- 웹 `actions.ts`(Server Action) → RN `api.ts`(fetch `/api/*`) + `mutations.ts`. **로직은 웹 API에, RN은 호출만.**

### 2. 상태는 컴포넌트/쿼리 캐시로
- 웹은 필터를 searchParams(URL)에 실었지만, RN은 **컴포넌트 상태 + React Query key**로. 필터 값이 바뀌면 query key가 바뀌어 재조회.

### 3. route는 얇게, 로직은 features에
- `app/`은 Expo Router 라우팅 껍데기(얇게). 화면 조립만.
- 데이터·컴포넌트·타입은 `src/features/<도메인>/`에 콜로케이션.
- 순수 로직(`completeness` 등)·zod 스키마는 웹에서 **복붙**해 `src/lib`·`src/schema`에(공유 패키지 안 만듦, 파일럿 스코프상 불필요).

### 4. 인증 세션
- Supabase 세션 토큰을 **expo-secure-store**에 저장(localStorage 아님). API 호출 시 `Authorization: Bearer <token>` 헤더로 전송(`api-contract.md` 참고).

---

## 필수: 모든 목록·데이터 화면에 3가지 상태

정상 상태만 만들지 말 것. 반드시 처리(웹 `STATES.md`와 같은 철학, RN 구현):
- **빈 상태**: 안내 문구 + 다음 행동 유도 버튼 (예: "아직 모집이 없어요. 첫 모집을 등록해보세요")
- **로딩**: 스켈레톤 (스피너보다 스켈레톤 선호). React Query `isLoading`.
- **에러**: 안내 + "다시 시도" 버튼. React Query `isError` + `refetch`.

문구는 `docs/STATES.md` 참고(웹과 동일 문구 유지).

---

## 폼 검증 규칙

- **zod 스키마는 `src/schema/`에**(웹 `features/*/schema.ts`에서 복붙). 클라이언트 검증에 사용, 서버 검증은 웹 API가 담당(이중 검증).
- react-hook-form + `@hookform/resolvers`(zod). 제출 시 전체 + 블러 시 해당 필드. **타이핑 중엔 에러 안 띄움.**
- 표시: 입력 필드 테두리 강조 + 아래 에러 메시지.
- 서버 에러(중복 이메일·중복 지원 등)는 API 응답 `{ error, fieldErrors }`를 받아 필드/토스트에 표시.

---

## 폴더 구조 (Feature 기반 · 콜로케이션)

"함께 바뀌는 것은 함께 둔다." `app/`은 라우팅만, 로직은 `src/features/`에. 상세 트리는 `docs/rn-pilot-plan.md` 2장.

```
TeamUp-mobile/
├─ app/                       # Expo Router 라우트 (얇게)
│  ├─ _layout.tsx             # QueryClientProvider + Supabase 세션 + 테마
│  ├─ index.tsx               # 세션 보고 (app) 또는 (auth)로 리다이렉트
│  ├─ (auth)/ login.tsx signup.tsx _layout.tsx
│  └─ (app)/ _layout.tsx(인증가드+탭) recruit/index·[id] dashboard.tsx
├─ src/
│  ├─ features/               # ★ 기능별 응집 (recruit / auth / dashboard)
│  │  └─ recruit/ api.ts queries.ts mutations.ts components/ types.ts
│  ├─ components/ui/          # React Native Reusables (도메인 무관 디자인 시스템)
│  ├─ lib/                    # ← 웹 src/lib 복붙 (completeness 등 순수 함수)
│  ├─ schema/                 # ← 웹 features/*/schema.ts 복붙 (zod)
│  ├─ server/supabase.ts      # secure-store 세션 클라이언트
│  └─ config/                 # env·API base URL·디자인 토큰(앰버/먹)
├─ tailwind.config.js global.css app.json eas.json
```

**원칙**:
- **app/은 얇게, features/는 두껍게** — 라우트는 features의 컴포넌트·훅을 조립만.
- **콜로케이션** — 한 기능의 컴포넌트·api·쿼리·타입을 같은 폴더에.
- **읽기/쓰기 분리** — `queries.ts`(useQuery) + `mutations.ts`(useMutation), 네트워크 호출은 `api.ts`.
- **로직 중복 금지** — 비즈니스 로직은 웹 `/api/*`에. RN은 호출만. `completeness`만 순수 함수라 복붙.

---

## 디자인 규칙 (상세: docs/DESIGN.md)

- **앱 내부 담백하게** — 흰 배경 + 카드 + 여백. (웹의 화려한 랜딩은 모바일에 없음)
- **공통 브랜드**: 앰버(`#FFA940`) 포인트 + 따뜻한 먹(`#2B2620`) 텍스트.
- 앰버는 **버튼/활성탭/게이지/아이콘에만**. 흰 배경 위 텍스트 색으로 쓰지 말 것.
- 색은 `src/config`의 디자인 토큰 / NativeWind `tailwind.config.js` 변수로. **하드코딩 금지.**

---

## 코드 컨벤션

- 컴포넌트 파일명: kebab-case (`recruit-card.tsx`), 컴포넌트명: PascalCase.
- 타입은 웹에서 온 것/직접 정의. 임의 중복 정의 지양.
- 하드코딩된 색/폰트 금지 → 항상 토큰 사용.
- 주석은 "왜"를 설명 (무엇은 코드가 말해줌).

---

## 커밋 메시지 컨벤션 (웹과 동일)

AI 에이전트가 커밋 메시지를 추천할 때 Conventional Commits 준수.
`타입(선택: 도메인): 작업 요약 (한국어 권장)`
- **feat**: 새 기능 / **fix**: 버그 수정 / **design**: UI 디자인 변경(기능 무관) / **refactor**: 구조 개선 / **chore**: 설정·패키지·빌드 / **docs**: 문서 / **style**: 포맷팅·오타

---

## 하지 말 것

- ❌ Expo Go로 실기기 테스트 시도 (SDK 57 > Expo Go 54, 안 됨 → dev build 사용)
- ❌ `npm install`로 Expo 관련 패키지 설치 (→ `npx expo install`)
- ❌ 웹의 Server Component/Server Action 패턴을 RN에 이식 (→ React Query)
- ❌ 필터를 URL/searchParams로 (RN엔 없음 → 상태 + query key)
- ❌ 비즈니스 로직을 RN에 중복 구현 (→ 웹 `/api/*` 호출)
- ❌ localStorage/sessionStorage 또는 웹 스토리지 (→ expo-secure-store)
- ❌ 하드코딩 색/폰트 (→ 디자인 토큰)
- ❌ **`.env` 직접 생성·수정·삭제** (실제 키. `.env.example`만 관리)
- ❌ **허락 없이 git push / commit** — 커밋 메시지 추천만

---

## 환경변수 (.env) — 중요

- **`.env`는 절대 직접 건드리지 말 것.** 실제 키가 든 파일.
- `.env.example`(플레이스홀더만) 로 필요한 변수 안내. Expo는 `EXPO_PUBLIC_` 접두사 변수만 클라이언트에 노출됨.
  - 예: `EXPO_PUBLIC_API_BASE_URL=`, `EXPO_PUBLIC_SUPABASE_URL=`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`
- 실제 값 입력은 사용자가 직접. 값을 요구하거나 채우지 말 것.

---

## 실행 / 테스트 방법

- **웹 미리보기(화면만 빠르게)**: `npx expo start --web` (secure-store 등 네이티브 기능은 제한)
- **Android 실기기(제대로)**: development build 필요 —
  `eas build -p android --profile development` (또는 `--profile internal`로 설치형 APK) → 폰에 설치 → `npx expo start`로 Metro 붙이기
- **OTA 갱신**: `eas update` (재빌드 없이 JS 번들 갱신)
- **유닛 테스트**: Jest + jest-expo + React Native Testing Library (`completeness`·스키마·컴포넌트)
- **E2E**: Maestro `.yaml` 플로우(척추 여정) + `assertWithAI` 어서션

---

## 참고 문서 (docs/)

- `PRD.md` — 서비스·기능 명세 (웹과 공유, 동일)
- `rn-pilot-plan.md` — ★ RN 파일럿 범위·구조·테스트·배포 전략·완료 기준
- `api-contract.md` — ★ RN이 호출하는 웹 `/api/*` REST 계약
- `ARCHITECTURE-mobile.md` — RN 아키텍처(웹과의 매핑)
- `SCHEMA.md` — 데이터 모델 (웹과 공유, 동일 DB)
- `DESIGN.md` — 디자인 시스템 (RN/NativeWind 적용 버전)
- `STATES.md` — 빈/로딩/에러 + 폼 검증 (RN 구현)
- `DEVLOG.md` — 데일리 작업 로그 (작업 끝낼 때 맨 위에 추가)
