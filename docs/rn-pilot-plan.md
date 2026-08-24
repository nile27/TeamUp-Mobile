# RN 파일럿 계획 — TeamUp 모바일 확장

> Phase 1.5. 목적: React 역량의 모바일 확장 증명(포트폴리오/파일럿). 실서비스 대체·전체 기능 패리티 아님.
> 백엔드는 기존 Next.js/Prisma/Supabase 재사용. Spring 전환은 보류(전제 아님).

---

## 1. 파일럿 화면 범위 & 순서

핵심 사용자 여정 하나(PRD 플로우 B — 개발자가 프로젝트 찾아 지원)를 **끝까지 완결**시키는 방향.

**Tier 0 — 척추 (필수)**
1. 로그인/회원가입 (Supabase Auth SDK)
2. 모집 목록 (React Query 읽기, 필터, 빈/로딩/에러)
3. 모집 상세 (완성도 게이지·역할)
4. 지원 흐름 (API 경유 mutation, 중복지원 방지)

**Tier 1 — 여정 완결 (여유 시)**
5. 대시보드(지원한 모집 탭) — 루프 닫기, 웹↔앱 데이터 일관성 증명
6. 모집 작성 — 구조화 폼 + 실시간 완성도 게이지(모바일 폼 UX 증명)

**Tier 2 — 제외**: 랜딩(웹 마케팅용), 커뮤니티·승격(부가 층), 스토어 출시.

---

## 2. 디렉토리 구조 (폴리레포)

웹은 그대로 두고, `api/` 라우트만 신설. RN은 독립 레포.

```
~/Desktop/
├─ TeamUp/                    # ① 기존 웹 (Next.js) — api 라우트만 신설
│  └─ src/
│     ├─ app/
│     │  ├─ (auth)/ recruit/ community/ dashboard/
│     │  └─ api/          ★NEW  # RN이 호출할 얇은 REST 라우트
│     │     ├─ recruit/route.ts        # 목록/생성
│     │     ├─ recruit/[id]/route.ts   # 상세
│     │     └─ applications/route.ts   # 지원(비즈니스 로직)
│     ├─ features/            # queries/actions/schema (api가 재사용)
│     ├─ lib/                 # completeness 등  → RN이 복붙
│     ├─ server/  config/  components/
│
└─ TeamUp-mobile/             # ② 신규 RN (Expo) — 독립 레포
   ├─ app/                    # Expo Router 라우트 (얇게)
   │  ├─ _layout.tsx          # QueryClient·Supabase세션·테마
   │  ├─ index.tsx            # 세션 보고 리다이렉트
   │  ├─ (auth)/ login.tsx signup.tsx
   │  └─ (app)/ _layout.tsx(인증가드+탭) recruit/index·[id] dashboard.tsx
   ├─ src/
   │  ├─ features/            # recruit/auth/dashboard
   │  │  └─ recruit/ api.ts queries.ts mutations.ts components/ types.ts
   │  ├─ components/ui/        # React Native Reusables (shadcn RN 포트)
   │  ├─ lib/                 # ← TeamUp/src/lib 복붙 (completeness 등)
   │  ├─ schema/              # ← TeamUp features/*/schema.ts 복붙 (zod)
   │  ├─ server/supabase.ts    # secure store 세션
   │  └─ config/              # env·api base URL·디자인 토큰(앰버/먹)
   ├─ tailwind.config.js  global.css  app.json  eas.json  package.json
```

**웹↔RN 매핑 (1:1)**
- 웹 `page.tsx`(서버 `await 조회`) → RN 라우트 + `features/*/queries.ts`(React Query 훅)
- 웹 `actions.ts`(Server Action) → RN `api.ts`(fetch `/api/*`) + `mutations.ts`(useMutation). **로직은 웹 API에, RN은 호출만** → 중복 없음.
- `lib/completeness.ts`·`schema/`(zod)만 복붙. 공유 패키지 X(스코프상 불필요).
- 인증: 웹·RN 같은 Supabase 프로젝트 → 계정·데이터 공유.

**추가 스택**: NativeWind(RN용 Tailwind), React Native Reusables(shadcn RN 포트), React Query(RN 전용), Supabase SDK, Expo Router.

---

## 3. 테스트 전략 (RN)

> 2026 기준 RN 테스트는 "Jest(유닛) + Maestro(E2E)"가 신규 프로젝트 표준. Detox는 강력하지만 셋업 복잡해 파일럿엔 과함.

**계층별**
- **정적**: TypeScript + ESLint (웹과 동일 규칙 감각).
- **유닛/컴포넌트**: **Jest + `jest-expo` 프리셋 + React Native Testing Library**(`@testing-library/react-native`). 순수 로직(복붙한 `completeness.ts`), zod 스키마, 컴포넌트 렌더/상호작용 검증. role/label 기반 쿼리(웹 Playwright와 같은 철학).
- **E2E**: **Maestro** 추천. YAML 플로우, 네이티브 코드 수정 불필요, **Expo Go·개발빌드·EAS 워크플로 모두 호환**, 블랙박스 방식(접근성 레이어)이라 플레이키 1% 미만·자동 재시도. 척추 여정(로그인→목록→상세→지원)을 `.yaml` 플로우로.
- (대안) Detox — 그레이박스(JS 스레드·네트워크 idle 감지)로 정밀하지만 셋업 무거움. 파일럿 후 필요해지면.

**AI 기반 테스트**
- **Maestro AI** — 플로우 안에서 `assertWithAI`(자연어 단언), `extractTextWithAI` 등 AI 어서션 지원. 화면 상태를 자연어로 검증할 수 있어 셀렉터가 흔들려도 견고. 파일럿에선 이 정도가 실용적.
- 이외 상용(QA.tech, Waldo 류)도 있으나 파일럿엔 불필요.

**파일럿 최소선**: Jest로 `completeness`·스키마 유닛 + Maestro로 척추 여정 1개 플로우. 여기에 AI 어서션 한두 개 얹어 "AI 테스트도 다뤘다" 포인트.

---

## 4. 배포 전략 (Vercel 못 씀 → Expo EAS)

> 웹은 Vercel 그대로. RN은 스토어 정식 출시 없이 **EAS로 내부 배포 + OTA**.

**개발 중**
- **Expo Go** — 가장 빠른 반복. 단 Expo SDK 모듈만 됨(네이티브 커스텀 시 개발빌드 필요).
- **Development build**(EAS) — 커스텀 네이티브 필요해지면.

**공유/시연 (파일럿 핵심)**
- **EAS Build + `"distribution": "internal"`** — Android APK / iOS ad-hoc 빌드 생성. **개발 서버 없이 설치 가능**, URL(32자 UUID)로 공유. 포트폴리오 시연·내부 테스터용으로 딱. (원하면 Expo 계정 인증 걸어 접근 제한 가능)
- **EAS Update** — JS 번들 OTA 업데이트. `eas update`로 새 번들 업로드 → 재빌드 없이 갱신. "PR마다/초기 컨셉 공유"에 적합. Vercel의 지속배포에 가장 가까운 감각.

**나중에 (파일럿 범위 밖)**
- **EAS Submit** → App Store / Play (스토어 출시). 지금은 안 함.

**CI**: GitHub Actions에서 테스트(Jest/Maestro) 실행 + EAS Build 트리거 가능. 파일럿 초반엔 수동 `eas build`/`eas update`로 충분.

**파일럿 배포 최소선**: `eas.json`에 internal 프로필 → `eas build`로 설치형 1개 만들어 실기기 시연 + `eas update`로 갱신. 스토어 제출 X.

---

## 5. "RN 파일럿 완료" 판단 기준

**필수 통과선**
- 여정 완결: Expo 앱에서 로그인→목록→상세→지원까지 실기기로 끊김 없이.
- 인증 재사용: 웹에서 만든 계정으로 앱 로그인 성공.
- 웹↔앱 데이터 일관성: 앱 지원이 웹 DB·대시보드에 반영됨.

**품질 기준**
- 목록·상세에 빈/로딩/에러 3상태.
- 디자인 토큰(앰버 #FFA940 / 먹 #2B2620) 일치, NativeWind 적용.
- Jest 유닛 + Maestro 척추 플로우 1개 통과.
- EAS internal 빌드로 설치형 시연 가능.
- README + 짧은 데모(녹화/스크린샷)로 포트폴리오화.

**비목표**: 스토어 출시, 전체 기능 패리티, 커뮤니티, 푸시/오프라인.
