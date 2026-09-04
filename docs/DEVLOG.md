# DEVLOG.md — 모바일 작업 로그

> 데일리 작업 로그. 작업 끝낼 때 맨 위에 추가. (그날 한 일 · 막힌 것 · 다음 할 일)

---

## 2026-09-04 (2) — 로딩 스켈레톤 애니메이션 + 404 처리 (기능, 디자인과 무관)

**배경**: 디자인 파일럿 확인하다가 "로딩이 그냥 멈춰있는 회색 박스라 로딩 중인지 알기 어렵다", "404/삭제된 데이터 접근 처리가 필요하지 않냐"는 지적 — 순수 디자인이 아니라 실제 동작이 바뀌는 부분이라 별도 커밋으로 분리.

**로딩 스켈레톤 애니메이션**: `src/components/skeleton.tsx` 신설 — `react-native-reanimated`로 opacity가 0.5~1 사이를 은은하게 반복하는 펄스 애니메이션. 모집/커뮤니티 목록·상세, 마이페이지, 지원자 확인 화면의 멈춰있던 회색 박스를 전부 이걸로 교체(크기/모양 값은 그대로, 컴포넌트만 교체).

**404 처리 — 라우트 자체가 없는 경우**: `app/+not-found.tsx` 신설(Expo Router 파일 규칙 — 매칭되는 라우트가 없으면 자동 렌더링). 기존엔 Expo Router 기본 안내 화면이 떴는데, 브랜드 톤 커스텀 화면으로 대체.

**404 처리 — 데이터가 삭제된 경우**: 모집/커뮤니티 목록에 캐시로 남아있는 카드를 눌렀는데 그 사이 글이 삭제됐으면 상세 API가 `404`를 반환함 — 이걸 기존처럼 "다시 시도" 버튼이 있는 일반 에러 화면으로 보여주면 안 됨(재시도해도 어차피 없음). `src/components/not-found-state.tsx`로 404 전용 UI(아이콘+안내+목록으로 돌아가기 버튼)를 공용 컴포넌트로 뽑아 `+not-found.tsx`와 `recruit/[id].tsx`/`community/[id].tsx`가 함께 사용. 두 상세 화면 모두 `error instanceof ApiError && error.status === 404`일 때만 이 화면으로 분기하고, 그 외 에러는 기존 "다시 시도" 화면 유지.

**테스트 방법 메모**: 404 화면은 실제로 트리거하기 까다로워서, 하단 탭의 커뮤니티 버튼 `href`를 잠깐 존재하지 않는 경로로 바꿔서 확인 후 원복하는 방식으로 검증함.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-09-04 — `minimalist-ui` 스킬 파일럿 적용 (`design/from-scratch-taste-skill` 브랜치)

**배경**: 기존 `redesign-existing-projects` 스킬 말고, `taste-skill` 레포에 있는 다른 스킬들로 "처음부터 새로 디자인"해보고 싶다는 요청 — 후보 검토 후 `minimalist-ui`(웜 모노크롬 + 절제된 파스텔, 에디토리얼 타이포)부터 시도하기로 함. 웹 CSS 기준 스킬이라 RN으로 재해석해서 적용(`redesign-existing-projects` 때와 같은 패턴).

**설치**: `npx skills add https://github.com/Leonxlnx/taste-skill --skill "minimalist-ui"` — CLI가 두 번 중간에 멈춰서(타임아웃) `.agents/skills/minimalist-ui/SKILL.md`가 빈 채로 남았던 걸 GitHub에서 직접 받아 채우고 `skills-lock.json`도 수동으로 맞춤.

**RN 재해석 요약**
- 타이포/아이콘(커스텀 세리프 폰트, Phosphor 아이콘 교체)은 이번 파일럿 범위에서 제외 — 폰트 라이선스·전역 아이콘 교체는 비용이 커서 색/여백/테두리/모션만 우선 적용.
- 색이 꽉 찬 큰 박스(필터 박스 `bg-amber-soft`, 랜딩 히어로 `bg-amber-soft` 등) → 흰 배경 + 얇은 테두리로. 스킬의 "큰 요소에 원색 배경 금지" 원칙.
- 카드(`bg-gray-50` 배경 채움) → 흰 배경 + `border border-gray-200`, 그림자 완전 제거. radius도 `2xl`(16px)에서 스킬 권장 상한(`12px`) 쪽으로.
- 새 색 토큰 `canvas-soft`(`#FBFBFA`, `tailwind.config.js` + `src/config/theme.ts`) 추가 — 순백 대신 아주 옅은 웜 오프화이트를 화면 배경으로.
- 리스트(모집/커뮤니티/랜딩 섹션)에 `react-native-reanimated`의 `FadeInUp`으로 인덱스만큼 지연된 순차 진입 애니메이션 추가(이미 설치된 의존성이라 새 빌드 불필요).
- 적용 범위: 모집 목록/상세/지원자 확인, 커뮤니티 목록/상세, 마이페이지, 로그인/회원가입/랜딩, 공용 헤더 — 전 화면.

**사용자 반응**: "전 디자인이나 지금이나 둘 다 괜찮다" — 원래 디자인이 이미 웜톤/절제된 색 방향이라 극적인 차이가 안 느껴졌을 것으로 판단. 다음은 `design-taste-frontend`(더 과감한 스킬)로 비교해볼 예정.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-09-01 (3) — 앱 아이콘을 TeamUp 브랜드 로고로 교체

**배경**: Expo 기본 템플릿 아이콘(파란 "A" 로고)을 그대로 쓰고 있던 것을 실제 브랜드 로고로 교체.

**적용**: 웹 레포의 `public/brand/logo-symbol.png`("Ti" 심볼, 앱 헤더 워드마크와 같은 로고, 원본 180x180)를 흰 배경 위에 올려서 필요한 사이즈로 생성.
- `assets/icon.png`(1024x1024, 흰 배경, iOS/기본 아이콘)
- `assets/android-icon-foreground.png`(512x512, 투명 배경, adaptive icon 전경)
- `assets/android-icon-background.png`(512x512, 흰색 단색, adaptive icon 배경)
- `assets/android-icon-monochrome.png`(432x432, 검정 실루엣, 투명 배경, Android 13+ 테마 아이콘용)
- `assets/favicon.png`(48x48, 흰 배경, 웹 탭 아이콘)
- `app.json`의 `android.adaptiveIcon.backgroundColor`를 기존 연한 파랑(`#E6F4FE`, 기본 템플릿 값)에서 흰색(`#FFFFFF`)으로 변경

원본이 180x180이라 1024까지 업스케일했는데, 로고 자체가 단순한 플랫 컬러 도형이라 확대해도 경계가 깨끗하게 유지됨(고해상도 원본 벡터는 없음 — 나중에 벡터본이 생기면 교체 권장).

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**주의**: 앱 아이콘은 네이티브 리소스라 OTA(`eas update`)로는 반영 안 되고 새 `eas build` 필요.

---

## 2026-09-01 (2) — 지원자 확인 화면 신설 (`fix/own-recruit-apply-and-applicants` 브랜치)

**배경**: 웹 세션이 핸드오프 요청(본인 지원 차단 서버 검증 + 지원자 확인 REST API 신설) 처리 완료 후 프로덕션 배포까지 끝냄(`docs/local/from-web-applicants-api-response.md`). 확정된 API로 모바일에 지원자 확인 기능 신규 구현.

**추가한 것**
- `src/lib/api-client.ts`: `apiPatch` 헬퍼 추가.
- `src/features/recruit/types.ts`: `Applicant`/`ApplicantApplication`/`RecruitApplicants` 타입 추가.
- `src/features/recruit/api.ts`: `fetchApplicants`(`GET /api/recruit/[id]/applicants`), `updateApplicationStatus`(`PATCH /api/applications/[id]/status`) 추가.
- `src/features/recruit/queries.ts`: `useApplicants` 쿼리 추가.
- `src/features/recruit/mutations.ts`: `useUpdateApplicationStatus` 뮤테이션 추가(성공 시 지원자 목록 + 마이페이지 쿼리 무효화).
- `app/(app)/recruit/[id]/applicants.tsx` 신설 — 지원자 카드 리스트(아바타/닉네임/자기소개/포트폴리오/지원 메시지) + `PENDING` 상태일 때만 수락/거절 버튼. 웹의 `/recruit/[id]/applicants` 페이지를 참고해 RN 컴포넌트로 새로 구성(마크다운 렌더링 라이브러리는 없어서 포트폴리오·자기소개는 평문 그대로 표시).
- `app/(app)/_layout.tsx`: `recruit/[id]/applicants` 라우트를 하위 화면(`showBackButton: true`, 탭바 노출 안 함)으로 등록.
- `app/(app)/recruit/[id].tsx`: 작성자 본인일 때 지원 버튼을 "지원자 확인하기 (N)"으로 바꾸고 누르면 위 화면으로 이동하도록 변경(이전엔 그냥 비활성화만 해뒀던 것 — 웹의 "지원자 확인하기" 버튼과 동작 통일).
- `docs/api-contract.md`: `GET /api/recruit/[id]/applicants`, `PATCH /api/applications/[id]/status`, `POST /api/applications`의 `404`/본인 지원 차단 `400` 케이스 반영.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 내 모집글 상세 → "지원자 확인하기" 진입, 수락/거절 버튼 동작, 상태 배지 갱신, pull-to-refresh.
- [ ] 확인 끝나면 `dev` 머지 + `eas update --channel internal`로 OTA 반영(네이티브 모듈 변경 없어 재빌드 불필요).

---

## 2026-09-01 — 내 모집글에 내가 지원 가능하던 버그 수정 (`fix/own-recruit-apply-and-applicants` 브랜치)

**신고된 증상**: 본인이 작성한 모집글 상세 화면에서 "지원하기" 버튼이 그대로 활성화돼 있어 자기 글에 지원이 가능했음. 추가로 모바일엔 작성자가 지원 현황(지원자 목록)을 확인할 방법이 아예 없다는 지적도 있었음.

**원인**: `app/(app)/recruit/[id].tsx`에 삭제 버튼 노출용으로 `isAuthor`를 계산해두고도 정작 지원하기 버튼의 `disabled`/`handleApply` 로직에는 반영하지 않았음. 웹 소스(`~/Desktop/TeamUp`)를 확인해보니 `POST /api/applications` 서버 쪽에도 작성자 본인 지원을 막는 검증이 없고, 웹은 프론트에서 작성자일 때 지원 폼 자체를 안 그리는 방식(`isAuthor` 분기)으로만 막고 있었음 — 즉 서버 API 자체의 인가 허점이고, 모바일은 그 프론트 가림막마저 빠져 있었던 것.

**수정(모바일 범위만)**: `isAuthor`일 때 지원 버튼을 비활성화하고 "내가 등록한 모집글이에요 (지원자 N명)"으로 문구를 바꿈. `handleApply`에도 `isAuthor` 조기 반환 추가.

**지원 현황(지원자 목록) 확인 기능은 이번에 보류**: 웹은 `/recruit/[id]/applicants` 페이지(지원자 목록 + 수락/거절)가 있지만 Server Component/Server Action으로만 구현돼 있어 모바일이 호출할 REST API가 없음(`getRecruitForApplicants`/`updateApplicationStatus` 둘 다 직접 Prisma 호출). 모바일 혼자 구현 불가 — 웹 쪽에 REST API 신설이 선행돼야 함(사용자 확인 후 이번엔 범위에서 제외, 필요해지면 웹에 핸드오프 프롬프트 전달 예정).

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 웹 API에 `GET /api/recruit/[id]/applicants`(작성자 전용), 지원 수락/거절 엔드포인트 신설 요청 — 완료되면 모바일에 지원 현황 화면 추가.
- [ ] 웹 `POST /api/applications`에도 작성자 본인 지원을 막는 서버 검증 추가를 웹 세션에 별도로 알릴 것(현재는 REST API 레벨의 인가 허점).

---

## 2026-08-28 (19) — EAS internal 빌드 배포 + GitHub Release 공유 + 환경변수 크래시 수정

**배경**: 개발 파일럿을 여기서 일단 마무리하기로 하고, 시연 가능한 APK를 GitHub Release로 공유하기로 함.

**expo-updates 도입**: `eas update` 최초 실행 시 이 프로젝트에 없던 `expo-updates`가 자동 설치되고 `app.json`에 `updates.url`/`runtimeVersion` 설정이 추가됨(별도 커밋 07f8536). **주의**: 이 시점 이전에 빌드된 APK(`b8f3023a...` dev client)는 이 네이티브 모듈이 없어 OTA를 받을 수 없음 — OTA는 이 커밋 이후 새로 빌드된 APK부터만 유효.

**크래시 삽질 → 원인 → 수정**: `eas build -p android --profile internal`로 첫 internal APK를 빌드해 GitHub Release(`v1.0.0-internal`)에 올렸는데, 설치 후 **실행하자마자 바로 꺼짐**. 원인: EAS 프로젝트의 클라우드 환경변수(`eas env:list`)가 `preview`/`development` 둘 다 비어있어서, 빌드 시 `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 안 들어간 채 빌드됨 — Supabase 클라이언트 초기화가 앱 시작과 동시에 실패해 즉시 크래시. `.env`는 `.gitignore`(로컬 전용) 대상이라 EAS 빌드 서버로 넘어가지 않고, EAS 클라우드 환경변수로 별도 등록해야 하는 걸 몰랐던 게 원인.

**수정**: `eas env:set`으로 `.env`의 3개 값(`EXPO_PUBLIC_API_BASE_URL`/`EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)을 `preview`·`development` 환경 둘 다에 등록(`production`은 아직 미등록 — 나중에 실제 프로덕션 빌드 쓸 때 추가 필요) → 재빌드 → 정상 실행 확인.

**배포**: 최종 APK를 GitHub Release `v1.0.0-internal`(https://github.com/nile27/TeamUp-Mobile/releases/tag/v1.0.0-internal)에 첨부. 설치 방법(출처 불명 앱 허용)과 "포트폴리오용 파일럿, 실서비스 아님" 안내를 릴리즈 노트에 포함.

**다음 할 일**:
- [ ] `production` 환경변수도 등록해두기 (나중에 정식 배포 프로필 쓸 때).
- [ ] 이후 JS/스타일만 바뀌는 변경은 재빌드 없이 `eas update --channel internal`로 이 APK에 OTA 반영 가능.

---

## 2026-08-28 (18) — 랜딩 화면 redesign 스킬 적용

**적용**: `.agents/skills/redesign-existing-projects`의 오디트 체크리스트를 `app/(auth)/landing.tsx`에 적용.
- 아이콘 통일: 문제(Why TeamUp)/역할(Participation) 섹션의 이모지(🤔🔍🚀💡✍️💻)를 커뮤니티/모집 화면과 같은 Ionicons(`bulb-outline`/`people-outline`/`rocket-outline`/`create-outline`/`code-slash-outline`)로 교체, 앰버 톤 원형 배지 안에 배치.
- 헤드라인 타이포 강화: Hero `text-3xl`→`text-4xl`, 섹션 소제목 `text-xl`→`text-2xl`, 트래킹 타이트하게.
- 앰버 틴트 섀도우: FilterCarousel 때 썼던 패턴(`shadow-amber-deep/10~30`)을 CTA 버튼·스텝 넘버 배지·역할 카드에 적용해 밋밋한 `shadow-none`/무배경 카드 탈피.
- 프레스 피드백: 뒤로가기 버튼·CTA 버튼에 `active:opacity-*` 추가(눌렀을 때 반응 없던 문제).
- 여백: 섹션 간 padding/gap을 한 단계씩 키움(`py-10`→`py-12`, `gap-5/6`→`gap-6/7`).

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 (17) — 로그인/회원가입 입력창 높이 고정값과 padding 충돌로 텍스트가 내부 스크롤되던 버그

**증상**: "Placeholder에 왜 스크롤이 되는지 모르겠다" — 로그인/회원가입 입력창에 포커스하면 안에서 텍스트/placeholder가 위아래로 살짝 스크롤되는 느낌.

**원인**: `Input` 기본 스타일이 `h-10`(40px) 고정인데, 로그인(`py-3 pl-10 pr-4`)·회원가입(`px-4 py-3`) 쪽에서 세로 padding만 추가하고 높이는 덮어쓰지 않았음. `py-3`(24px) + 텍스트 줄높이(`leading-5`, 20px) ≈ 44px가 40px 박스에 안 들어가서, `TextInput`이 내용을 보여주려고 내부적으로 스크롤.

**수정**: 로그인 2개, 회원가입 3개 `Input`에 `h-12`(48px) 명시로 고정 높이를 늘려서 padding+텍스트가 여유있게 들어가도록 함.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 (16) — 회원가입 "로그인" 링크 색상을 앰버 계열로 통일

**변경**: `app/(auth)/signup.tsx`의 "이미 계정이 있으신가요? 로그인" 링크를 로그인 화면의 "회원가입" 링크와 동일한 패턴(일반 텍스트 + `text-amber-deep font-semibold underline` 링크 분리)으로 맞춤. 기존엔 전체가 `text-ink-soft` 단색 링크라 클릭 가능한 부분이라는 티가 안 났음.

**검증**: `npx tsc --noEmit` 통과.

---

## 2026-08-28 (15) — 네이티브 랜딩 화면 신설 (삼성 인터넷 강제 다크모드 우회)

**배경**: 2026-08-25에 "웹 랜딩페이지를 시스템 브라우저로 열기"로 결정했었는데, 실기기 확인 결과 **삼성 인터넷이 `color-scheme` 메타 태그(웹 쪽에서 이미 추가 확인)를 무시하고 페이지에 강제로 다크모드 CSS를 씌움** — 브라우저가 사용자 설정으로 강제 적용하는 기능이라 웹 쪽에서 막을 방법이 없음을 확인. "웹으로 우회"라는 원래 전제가 깨져서, 앱 안에 자체 라이트 고정 화면으로 대체하기로 결정.

**적용**: `app/(auth)/landing.tsx` 신설 — 웹 랜딩(`src/components/landing/*`)의 핵심 카피(Hero, Why TeamUp, How it works, Participation, Final CTA)만 가져와서 우리 컴포넌트(`Text`/`Button`, amber/ink 토큰)로 압축 재구성. 마케팅 사이트 전체 복제 아니고 "TeamUp이 뭔지" 핵심만. `login.tsx`의 "TeamUp이 궁금하다면?" 링크를 `Linking.openURL`(외부 브라우저) 대신 `router.push("/(auth)/landing")`(앱 내부 화면)으로 변경.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 랜딩 화면 진입/뒤로가기, "시작하기"(회원가입)·"둘러보기"(모집 목록)·"프로젝트 시작하기" 버튼 동작.

---

## 2026-08-28 (14) — 댓글/좋아요 등록 시 pull-to-refresh 스피너가 저절로 뜨던 버그

**증상**: 커뮤니티 댓글 등록 버튼 누르면, 화면 위쪽에 당겨서 새로고침한 것처럼 스피너가 잠깐 뜸.

**원인**: `RefreshControl`의 `refreshing` prop을 React Query의 `isRefetching`에 그대로 연결해뒀음 — `isRefetching`은 "당겨서 새로고침"이 아니라 **어떤 이유로든 백그라운드에서 재조회가 도는 중**이면 전부 `true`가 됨. 댓글 등록 성공 시 `invalidateQueries`로 일어나는 재조회, 좋아요/삭제 뮤테이션의 재조회, 모집 목록의 Realtime 구독으로 인한 재조회까지 전부 이 스피너를 저절로 띄우고 있었음.

**수정**: 커뮤니티 상세/목록, 모집 목록 3곳 전부 — 실제로 사용자가 당겨서 새로고침했을 때만 켜지는 별도 로컬 상태(`isManualRefreshing`)로 분리. `onRefresh`에서 그 상태를 켜고 `refetch()` 끝나면 끔.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 (13) — 모집 목록도 cursor 기반 무한 스크롤로 (웹 API breaking change 반영)

**배경**: 모집(팀 찾기) 목록에 페이지네이션이 아예 없다고 확인했던 것 — 웹이 `GET /api/recruit`를 cursor 기반으로 바꿈(offset 방식은 스크롤 중 새 글이 끼어들면 중복/누락이 생겨서 무한 스크롤엔 cursor가 표준이라는 이유). **Breaking change**: 응답이 배열(`data: [...]`)에서 객체(`data: { recruits, nextCursor }`)로 바뀜.

**모바일 반영**
- `src/features/recruit/types.ts`: `RecruitListResponse = { recruits, nextCursor }` 추가.
- `src/features/recruit/api.ts`: `fetchRecruitList`가 `cursor` 파라미터를 받아 쿼리스트링에 실어보내고, 새 응답 타입으로 파싱.
- `src/features/recruit/queries.ts`: `useRecruitList`를 `useQuery` → `useInfiniteQuery`로(커뮤니티와 동일 패턴), `getNextPageParam`은 `nextCursor`.
- `app/(app)/recruit/index.tsx`: 페이지들을 펼쳐서(`pages.flatMap`) 하나의 목록으로, `FlatList`의 `onEndReached`에서 `fetchNextPage()`, 하단 로딩 스피너.
- `docs/api-contract.md` 갱신(`GET /api/recruit` 응답 모양 변경 반영).

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 모집 목록 스크롤 시 다음 페이지 자동 로드, 기술스택 필터 걸어도 정상 동작하는지.
- [ ] 커뮤니티도 cursor로 통일할지는 아직 미정(웹이 "강제 아님"이라고 함) — 필요해지면 논의.

---

## 2026-08-28 (12) — 하드웨어 뒤로가기가 탭 이동 이력을 안 타고 바로 앱 종료되던 것 수정

**증상**: 모집→커뮤니티→모집으로 탭 이동한 뒤 폰 하드웨어 뒤로가기를 누르면, 커뮤니티로 안 돌아가고 바로 앱이 꺼짐. `Tabs`의 `backBehavior` 기본값이 탭 이동 이력을 안 타는 쪽이었던 것.

**수정**: `app/(app)/_layout.tsx`의 `Tabs`에 `backBehavior="history"` 추가 — 인스타그램/배민 등 대부분의 탭 기반 앱이 쓰는 방식대로, 실제 이동한 탭 순서를 거슬러 올라가다가 더 갈 곳 없을 때 종료.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 (11) — 마이페이지 탭 제거(헤더 아바타로 대체) + 뒤로가기 버튼 판단 방식 수정

**"뒤로가기가 커뮤니티엔 있는데 모집엔 없다"는 실기기 피드백**: `router.canGoBack()`으로 판단했더니 탭 네비게이터 구조 특성상 일관되게 안 나옴(같은 패턴인데 화면마다 결과가 다름 — 정확한 근본 원인은 특정 못 함, 탭 전환 이력이 라우터의 "뒤로가기 가능" 판단에 관여하는 것으로 추정). **판단 방식 자체를 바꿔서 해결**: 화면이 탭 루트인지 하위 화면인지를 `Tabs.Screen options`에 `showBackButton`으로 명시하고, `AppHeader`는 그 값만 보고 뒤로가기 버튼을 그림 — 더 이상 라우터 상태를 추론하지 않음.

**마이페이지를 하단 탭에서 제거**: 헤더에 로그인 사용자 아바타(누르면 마이페이지로 이동)가 생겨서 하단 탭의 마이페이지 아이콘이 중복이라는 의견 — `dashboard` `Tabs.Screen`을 `href: null`로 바꿔 하단 탭 바에서 숨기고, `recruit/[id]`·`community/[id]`와 같은 "하위 화면" 취급으로 `showBackButton: true` 부여. 하단 탭은 이제 모집·커뮤니티 두 개만 남음.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 하단 탭에 마이페이지 아이콘이 빠졌는지, 헤더 아바타로 마이페이지 진입되는지, 모집/커뮤니티/마이페이지 상세 화면 전부 뒤로가기 버튼이 일관되게 뜨는지.

---

## 2026-08-28 (10) — 커뮤니티 무한 스크롤 + 커스텀 헤더(브랜드 워드마크)

**커뮤니티 무한 스크롤**: 웹 API(`page`/`totalPages`)는 이미 준비돼 있었는데 화면에서 `page`를 항상 1로만 호출하고 있었음 — `useCommunityList`를 `useInfiniteQuery`로 바꾸고 `FlatList`의 `onEndReached`에서 `fetchNextPage()` 호출, 하단에 로딩 스피너 표시. DB/API 변경 없이 모바일 쪽만으로 해결.
- **다음 예정**: 커서 기반으로 바꾸기로 사용자와 합의 — 웹 API를 `page`/`totalPages` → `cursor`/`nextCursor`로 바꾸는 핸드오프 프롬프트 전달함(웹 쪽 작업 대기 중). API 응답 모양 바뀌는 대로 모바일도 맞춰서 수정 예정.

**커스텀 헤더(브랜드 워드마크)**: "웹/모바일 같이 쓰는 다른 앱들에 비해 헤더가 개성 없어 보인다"는 피드백(참고 이미지: 링커리어) — 색상은 `DESIGN.md` 원칙(앰버는 버튼/아이콘에만, 내부는 흰 배경 유지)과 안 맞아서 그대로 안 따르고, 대신 React Navigation 기본 헤더(작은 타이틀 텍스트 하나뿐)를 커스텀 헤더로 교체:
- `src/components/app-header.tsx` 신설 — "TeamUp" 워드마크(앰버 점 + 굵은 타이포) + 화면 제목, 오른쪽엔 로그인 상태면 아바타(누르면 마이페이지 이동)·비로그인이면 로그인 버튼.
- `app/(app)/_layout.tsx`의 `Tabs` `screenOptions.header`로 교체 연결.
- **놓칠 뻔한 회귀**: 커스텀 `header`로 바꾸면 React Navigation이 자동으로 넣어주던 뒤로가기 버튼(모집 상세·커뮤니티 글 화면 등)이 같이 사라짐 — `AppHeader`에 `router.canGoBack()`일 때만 보이는 `chevron-back` 버튼을 직접 추가해서 복구.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 커뮤니티 스크롤 시 다음 페이지 자동 로드, 헤더 워드마크/아바타, 상세 화면 뒤로가기 버튼 정상 동작.
- [ ] 웹 쪽 커서 페이지네이션 작업 완료되면 모바일 `fetchCommunityList`/`useCommunityList` 반영.

---

## 2026-08-28 (9) — 캐러셀 페이드가 첫/마지막 칩 글자를 가리던 버그

**실기기 스크린샷 확인**: 모집 카드 기술 스택 캐러셀에서 첫 번째 칩("Vue.js", "TypeScript")의 앞글자가 흰색 페이드에 잘려 보임. `HorizontalCarousel`의 좌우 페이드 오버레이가 스크롤 위치와 무관하게 항상 떠 있어서, 더 스크롤할 콘텐츠가 없는 맨 처음/맨 끝에서도 페이드가 첫/마지막 칩을 덮고 있었던 것.

**수정**: `onScroll`/`onContentSizeChange`/`onLayout`로 스크롤 오프셋·콘텐츠/컨테이너 너비를 추적해서, 실제로 왼쪽/오른쪽에 가려진 콘텐츠가 있을 때만(`canScrollLeft`/`canScrollRight`) 해당 쪽 페이드를 렌더링하도록 변경.

**추가**: 로그인/회원가입 화면도 `react-native-keyboard-controller`의 `KeyboardAwareScrollView`를 커뮤니티 상세와 다른 모드(기본값 `"insets"`)로 쓰고 있었는데, 새 APK로 재확인해보니 커뮤니티는 되고 로그인/회원가입은 여전히 안 됨 — 커뮤니티에서 확인된 `mode="layout"`으로 셋 다 통일.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 캐러셀 첫/마지막 칩 글자가 안 잘리는지, 로그인/회원가입도 `mode="layout"`으로 키보드 가림 해결됐는지.

---

## 2026-08-28 (7) — 키보드 가림 문제, 결국 네이티브 라이브러리(`react-native-keyboard-controller`)로 재빌드

**실기기 확인 결과**: 어제 만든 수동 `Keyboard` 리스너 방식도 커뮤니티 상세에서 전혀 안 먹힘("화면이 전혀 안 움직임"). `npx expo prebuild`로 로컬에 네이티브 프로젝트를 생성해 `AndroidManifest.xml`을 직접 확인해보니 `windowSoftInputMode="adjustResize"`는 정상적으로 박혀있었음(확인 후 `/android` 폴더는 삭제, 원래 관리형 워크플로우 유지) — 즉 매니페스트 설정 문제가 아니라, **이 화면이 탭 네비게이터 안(react-native-screens Fragment)에 있어서 RN 기본 `Keyboard` 이벤트/윈도우 리사이즈가 그 안까지 안 전파되는 것**으로 추정. 로그인/회원가입(탭 밖, 별도 스택)에서는 정상 작동했던 것과 대비됨.

**결정**: JS 전용 방법으로는 한계라고 판단해 사용자 확인 후 네이티브 모듈이 필요한 `react-native-keyboard-controller`로 교체 진행(EAS 재빌드 필요, Metro 리로드만으로는 반영 안 됨).

**적용**
- `npx expo install react-native-keyboard-controller` (SDK 57 호환 확인됨).
- `app/_layout.tsx` 최상위를 `KeyboardProvider`로 감쌈(어느 화면에서든 이 라이브러리의 컴포넌트를 쓰려면 필수).
- `app/(app)/community/[id].tsx`: 수동 `Keyboard` 리스너/`scrollToEnd` 로직 전부 제거하고 `KeyboardAwareScrollView`(`mode="layout"`, `bottomOffset={16}`)로 교체 — `mode="layout"`이라 `mt-auto`인 입력 바가 키보드 공간만큼 실제로 레이아웃이 밀려 올라옴(네이티브로 키보드 위치를 직접 추적해서 react-native-screens Fragment 안에서도 동작).
- `app/(auth)/login.tsx`, `signup.tsx`: 기존에 쓰던 `react-native-keyboard-aware-scroll-view`(2021년산 오래된 라이브러리, 로그인/회원가입에선 됐지만 탭 화면에선 전혀 안 먹혔음)를 같은 `react-native-keyboard-controller`의 `KeyboardAwareScrollView`로 통일 — 라이브러리 하나로 일관성 유지. 기존 의존성은 `npm uninstall`로 제거.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과(웹은 네이티브 모듈이 스텁으로 처리돼 번들만 확인, 실제 동작 검증은 안 됨). EAS 개발 빌드(`development` 프로필) 실행 — 네이티브 코드가 추가된 변경이라 Metro 리로드로는 반영 안 되고 새 APK 설치가 필요함.

**다음 할 일**:
- [ ] EAS 빌드 완료되면 새 APK 재설치 후 로그인/회원가입/커뮤니티 댓글 세 화면 전부 키보드 가림 재확인.

---

## 2026-08-28 (6) — `react-native-keyboard-aware-scroll-view`가 탭 화면에서 안 먹어서 직접 구현으로 교체

**실기기 확인 결과**: 리로드해서 확인해보니 커뮤니티 상세에서 스크롤 자체가 전혀 안 움직임 — 로그인/회원가입(탭 밖, 별도 스택)에서는 됐는데 탭 네비게이터 안에 있는 화면에서는 라이브러리가 작동을 안 함. 2021년쯤 나온 오래된 라이브러리라 New Architecture(Fabric) + 탭 네비게이터 조합에서 포커스된 입력창을 찾아 위치를 계산하는 내부 로직이 안 먹는 것으로 추정(정확한 원인 확인은 못 함, 라이브러리 자체를 안 쓰는 쪽으로 우회).

**최종 해결 — 라이브러리 없이 표준 `Keyboard` API로 직접 구현**: 댓글 입력창이 이 화면에서 항상 맨 아래 요소라는 점을 이용:
- `Keyboard.addListener("keyboardWillShow"/"keyboardDidShow", ...)`로 키보드 높이를 상태로 저장, `ScrollView`의 `contentContainerStyle.paddingBottom`에 그 값을 그대로 줘서 키보드 높이만큼 스크롤 여유 공간 확보.
- 입력창 `onFocus` 시 `scrollRef.current?.scrollToEnd({ animated: true })` 호출 — 맨 아래로 스크롤되면서 방금 확보한 여유 공간 덕에 키보드 위로 올라옴.
- `react-native-keyboard-aware-scroll-view` 의존성은 그대로 두되(로그인/회원가입엔 정상 작동 중) 이 화면에서만 안 씀.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과. 실기기 확인은 사용자 몫.

**다음 할 일**:
- [ ] 실기기에서 확인: 댓글 입력창 포커스 시 키보드 위로 스크롤되는지.
- [ ] 이 패턴(라이브러리 대신 직접 구현)이 안정적으로 확인되면, 혹시 다른 탭 화면에도 비슷한 입력창이 생길 경우 재사용할 수 있게 훅으로 뽑아낼지 검토.

---

## 2026-08-28 (5) — 커뮤니티 댓글 입력창 키보드 가림, 결국 구조를 바꿔서 해결

로그인/회원가입은 고쳤는데, 사용자가 재확인해보니 커뮤니티 댓글 화면도 여전히 같은 증상. 이 화면은 `FlatList`(댓글 목록) + 화면 하단에 별도로 고정된 입력 바 구조라 `KeyboardAwareScrollView`를 그대로 못 씀(FlatList를 ScrollView로 감싸는 중첩 스크롤 문제, 어제도 같은 이유로 이 라이브러리를 여기 적용 안 하기로 했었음).

**최종 해결**: 댓글 수가 많지 않은 화면이라 `FlatList` 가상화를 포기하고, 전체(글 내용 + 댓글 목록 + 입력 바)를 `KeyboardAwareScrollView` 하나 안에 일반 콘텐츠로 넣음(댓글은 `.map()`으로 렌더). 입력창이 포커스되면 로그인/회원가입과 똑같은 방식으로 스크롤되어 키보드 위로 올라옴. pull-to-refresh는 `FlatList`의 `refreshControl` 대신 `ScrollView` 계열이 공통으로 지원하는 `refreshControl` prop으로 그대로 유지. 입력 바는 `mt-auto`로 콘텐츠가 적을 땐 화면 하단에 붙어있게.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 댓글 입력창 포커스 시 키보드에 안 가리는지, 댓글 많은 글에서도 스크롤이 자연스러운지 확인.

---

## 2026-08-28 (4) — 로그인/회원가입 키보드 가림을 `react-native-keyboard-aware-scroll-view`로 교체

사용자가 참고 링크(velog 글)로 제안한 `react-native-keyboard-aware-scroll-view` 라이브러리 적용 검토. 순수 JS 라이브러리라 dev-client 재빌드 없이 바로 테스트 가능.

**적용 범위 판단**: 이 라이브러리는 "ScrollView 안에 쌓인 입력창을 포커스 시 위로 스크롤"하는 방식이라, 화면 하단에 별도로 고정된 입력 바(그 위에 `FlatList`가 따로 스크롤되는) 구조인 **커뮤니티 댓글 화면엔 안 맞음**(FlatList를 ScrollView로 또 감싸는 중첩 스크롤 안티패턴이 됨) — 반대로 **로그인/회원가입처럼 세로로 쌓인 입력창 여러 개를 감싼 ScrollView 케이스엔 정확히 들어맞음**. 사용자 확인 후 로그인/회원가입에만 적용.

**적용**: `npm install react-native-keyboard-aware-scroll-view`, `app/(auth)/login.tsx`·`signup.tsx`의 수동 `KeyboardAvoidingView`+`ScrollView` 조합을 `KeyboardAwareScrollView` 하나로 교체(`enableOnAndroid`, `extraScrollHeight={20}`).

**주의**: `KeyboardAwareScrollView`는 NativeWind가 `className`을 자동 인식하는 컴포넌트 목록(View/Text/ScrollView 등 `react-native` 직수입 컴포넌트)에 없는 서드파티 컴포넌트라, `className`/`contentContainerClassName`을 줘도 스타일이 적용 안 됨 — 컴포넌트 자체엔 인라인 `style`/`contentContainerStyle`(일반 RN 스타일 객체)로 줘야 함. 내부 자식 요소(View/Text/Button/Input)는 그대로 NativeWind `className` 사용.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 로그인/회원가입 폼 하단 입력창(특히 회원가입의 비밀번호 필드)에 포커스했을 때 키보드에 안 가리는지 확인.

---

## 2026-08-28 (3) — 링크 탭 영역 버그 + 둘러보기 중 로그인 복귀 수단 없음

**"TeamUp이 궁금하다면?" 링크의 탭 가능 영역이 텍스트보다 넓음**: `Pressable`이 부모 flex-col의 기본 `align-items: stretch` 때문에 화면 너비 전체로 늘어나 있어서, 글자 옆 빈 공간을 눌러도 링크가 열림. `className="self-start"` 추가해 텍스트 크기만큼만 탭 영역이 줄어들게 수정. 같은 이유로 "로그인 없이 둘러보기"도 `items-center`(내부 정렬만 함, 컨테이너 자체는 여전히 풀와이드) → `self-center`(컨테이너 자체를 콘텐츠 크기로 줄이고 가운데 정렬)로 수정.

**비로그인 "둘러보기" 중 로그인 화면으로 돌아갈 직관적인 수단이 없음**: 지원하기/마이페이지 진입 시에만 간접적으로 로그인 화면으로 유도됐지, 그냥 둘러보다가 로그인하고 싶어지면 갈 방법이 없었음. `app/(app)/_layout.tsx`의 `Tabs` `headerRight`에 비로그인 상태일 때만 보이는 "로그인" 버튼 추가 — 모집/커뮤니티/마이페이지 어느 탭에 있든 헤더 오른쪽에 항상 노출.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 (2) — 로그인/회원가입 폼 "Invalid input: expected string" 버그 수정

**증상**: 로그인 화면에서 입력창 탭했다가 아무것도 안 치고 포커스를 다른 곳으로 옮기면(blur), 입력창 밑에 "Invalid input: expected string. received undefined"라는 zod 원본 에러 메시지가 그대로 노출됨.

**원인**: `useForm`에 `defaultValues`를 안 줘서 필드 초기값이 `undefined`였음. `mode: "onBlur"`라 아무것도 안 쳐도 blur 시점에 검증이 도는데, `z.string().email(...)`이 `undefined`를 받으면 `.email()` 커스텀 메시지("유효한 이메일 주소를 입력해주세요")까지 가기 전에 **기본 타입 체크(`string`)에서부터 실패**해서 zod가 자동 생성한 영어 원본 메시지가 그대로 뜬 것 — 스키마 자체는 정상이었고 폼 초기화 방식이 문제였음.

**수정**: `app/(auth)/login.tsx`, `signup.tsx` 둘 다 `useForm`에 `defaultValues: { email: "", ... }`(빈 문자열)를 추가 — 필드가 항상 `string` 타입으로 시작해서 커스텀 메시지가 정상적으로 뜨게 됨.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

---

## 2026-08-28 — 로그인 화면 리디자인 (여백 부족, 회원가입 버튼 존재감)

**피드백**: 요소마다 `mb-1`~`mb-6`로 제각각 촘촘하게 붙어있어 답답해 보임. 특히 "로그인 없이 둘러보기"와 "아직 계정이 없으신가요? 회원가입"이 바로 붙어있어서 구분이 안 되고, "회원가입" 링크는 일반 텍스트(`text-sm text-ink-soft`)라 버튼인지 인지가 안 됨.

**수정**: `app/(auth)/login.tsx` 레이아웃을 개별 `mb-*` 대신 섹션별 `gap`(헤더 `gap-2`, 폼 필드 `gap-5`, 필드 내부 `gap-1.5`, 버튼 그룹 `gap-3`)으로 재구성해 리듬을 통일하고 전반적으로 여백 확대. "회원가입"을 텍스트 링크에서 `Button variant="outline"`(로그인 버튼과 같은 크기, amber 테두리 + amber 글자색)으로 바꿔서 로그인 버튼 바로 아래 **버튼 그룹**으로 묶고, "로그인 없이 둘러보기"는 `mt-10`으로 확실히 떨어뜨려서 별개의 3차 액션(둘러보기)과 회원가입 유도(2차 액션)를 시각적으로 구분.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**추가 피드백 — "회원가입은 버튼 아니어도 됨" + "디자인 구림"**: 회원가입은 다시 텍스트 링크로(버튼화는 과했다는 의견) 되돌리되, 이전과 달리 `font-semibold text-amber-deep underline`으로 색·굵기를 줘서 최소한 "그냥 텍스트"와는 구분되게. 전체적으로 "redesign 스킬 쓴 거 맞냐"는 지적에 폼 자체를 다시 감사 — 입력창이 흰 배경에 회색 테두리만 있는 밋밋한 상자였던 걸 스킬의 "카드=테두리+흰배경 탈피" 원칙대로 정리:
- 폼 필드 전체를 `bg-gray-50 rounded-2xl p-5` 박스로 묶고(어제 만든 필터 캐러셀·모집 카드와 같은 패턴), 그 안의 입력창은 테두리 없이 흰 배경 + 옅은 그림자(`shadow-sm shadow-black/5`)로 박스 위에 "떠있는" 느낌.
- 이메일/비밀번호 입력창에 아이콘(`mail-outline`/`lock-closed-outline`) 추가 — 스캔하기 쉽고 밋밋함이 덜함.
- 로그인 버튼을 폼 박스 안 맨 아래로 이동시켜 "하나의 로그인 카드"처럼 응집.
- 제목 "로그인" 앞에 작은 amber 점(dot) 추가 — 필터 캐러셀 라벨과 같은 시각 문법으로 브랜드 일관성.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인 — 특히 카드 박스 안 그림자·아이콘이 의도대로 보이는지.
- [ ] 회원가입 화면(`signup.tsx`)도 같은 패턴으로 정리할지 결정.

---

## 2026-08-27 (6) — 모집 기술 스택을 가로 캐러셀로 변경

모집 목록 카드·상세 화면의 기술 스택 칩을 `flex-wrap`(줄바꿈) 방식에서 가로 스크롤 캐러셀(`ScrollView horizontal`)로 변경. 상세 화면은 그동안 `techStack` 전체를 줄바꿈으로 다 보여줬던 것도 캐러셀로 통일, 목록 카드는 기존에 4개까지만 자르던 것(`slice(0, 4)`)을 없애고 스크롤로 전부 볼 수 있게 함. 상세 화면엔 "기술 스택" 라벨도 추가(이전엔 라벨 없이 칩만 떠 있었음).

**추가 반영**: 사용자가 말한 "스킬 캐러셀"이 실은 모집 목록 상단의 **기술스택 필터 칩**(`FILTER_CHIPS`) 쪽이었음 — 이것도 `flex-wrap` → 가로 캐러셀로 변경하고, 8개로 자르던 것(`TECH_STACK_OPTIONS.slice(0, 8)`)도 없애 전체 옵션을 스크롤로 노출.

**UX 피드백 — 캐러셀인 게 티가 안 남**: 그냥 가로 `ScrollView`만 쓰면 실제로 스크롤은 되는데 "더 있다"는 시각적 힌트가 전혀 없어서 캐러셀인지 구분이 안 된다는 피드백. `src/components/horizontal-carousel.tsx` 신설 — 양쪽 끝에 배경색 페이드 + 화살표 아이콘(`chevron-back`/`chevron-forward`, 누르는 버튼 아니라 힌트용)을 얹은 재사용 컴포넌트. 필터 칩·모집 카드/상세의 기술 스택 캐러셀 3곳 전부 이걸로 교체. 필터 칩 위에는 "기술 스택으로 필터링" 소제목도 추가(원래 무슨 용도인지 설명이 없었음).

**시행착오 — `expo-linear-gradient`는 네이티브 모듈이라 Metro 리로드로 안 붙음**: 처음엔 `expo-linear-gradient`로 진짜 그라디언트를 만들었는데, 실기기에서 리로드하니 `Can't find ViewManager 'ViewManagerAdapter_ExpoLinearGradient'` 크래시 — 네이티브 코드가 필요한 패키지라 지금 설치된 dev-client APK엔 없어서 EAS로 새로 빌드해야만 반영되는 걸 놓쳤음. dev-client 재빌드 없이 바로 되게 하려고 패키지를 제거하고, 반투명 `View`를 여러 겹 겹쳐서(4단계 opacity) 그라디언트처럼 보이게 하는 순수 JS/스타일 방식으로 교체 — 네이티브 모듈 추가 없이 Metro 리로드만으로 반영됨.

**스크린샷 피드백 — 화살표가 칩 텍스트에 겹침**: 실기기 스크린샷 확인해보니 좌우 화살표 아이콘이 첫/마지막 칩 글자 위에 그대로 겹쳐서 "React"/"JavaScript" 글자가 가려 보임. 필터 칩 캐러셀을 별도 컴포넌트(`src/components/filter-carousel.tsx`)로 분리 — 화살표를 칩 행 위쪽 헤더 줄로 옮기고(라벨과 같은 줄, 오른쪽 정렬), 장식이 아니라 실제로 `scrollTo()`를 호출해 스크롤을 이동시키는 버튼으로 만듦. 전체를 `bg-gray-50 rounded-2xl p-4` 박스로 감싸서 하나의 컴포넌트처럼 보이게 하고, 칩 자체는 박스 배경과 구분되도록 흰 배경으로. 라벨 문구도 "기술 스택으로 필터링"(동사형) → "기술 스택"(간결한 소제목)으로 변경. `HorizontalCarousel`(모집 카드/상세의 작은 인라인 캐러셀용)은 화살표 없이 페이드만 남기는 걸로 단순화 — 좁은 카드 안에서는 헤더 줄을 따로 두기 애매해서.

**피드백 — 박스가 티가 안 남**: `bg-gray-50` 박스가 흰 화면 배경과 대비가 약해서 눈에 잘 안 띈다는 피드백. `FilterCarousel` 박스 배경을 `bg-gray-50` → `bg-amber-soft`(브랜드 앰버 톤)로 바꿔서 화면에서 확실히 구분되게 하고, 소제목도 `text-xs` → `text-sm font-semibold`(+ `text-amber-deep` 색)으로 키움. 활성 칩도 박스 배경(amber-soft)과 안 섞이도록 `bg-amber-soft` → 진한 `bg-amber` 채움으로 대비 강화.

**필터 초기화 버튼 추가**: 헤더 줄(라벨 옆)에 선택된 필터가 하나라도 있을 때만 "초기화" 버튼 노출 — 누르면 `stackFilter`를 빈 배열로.

**여전히 아쉽다는 피드백 — `redesign-existing-projects` 스킬로 이 컴포넌트만 다시 감사**: 칩·네비 버튼이 flat이라 깊이감이 없고(스킬의 "generic box-shadow 없음/flat with zero texture" 항목), 눌러도 피드백이 없던 것(스킬의 "No active/pressed feedback" 항목) 두 가지를 짚어서 재작업.
- 칩·네비 버튼·초기화 버튼에 배경 hue(amber)에 맞춘 **색조 그림자**(`shadow-amber-deep/10~30`, 스킬이 권장하는 "순수 검정 대신 배경 hue를 tint한 그림자") 추가 — 활성 칩은 진하게(`/30`), 비활성 칩은 옅게(`/10`)로 깊이 차등.
- 모든 `Pressable`에 `active:opacity-70` 추가 — 눌렀을 때 반응이 생기도록.
- 초기화·이전·다음 버튼을 같은 크기(`h-7`)·같은 흰 배경·같은 그림자로 통일해서 "네비게이션 컨트롤 그룹"처럼 보이게 정리, 라벨 앞엔 작은 점(dot) 추가.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 통과. 생성된 CSS에서 `shadow-amber-deep/10~30`도 정상 컴파일 확인.

---

## 2026-08-27 (5) — `redesign-existing-projects` 스킬로 디자인 리팩토링

**배경**: 웹 UI가 "2010년대스럽다"는 피드백으로 `taste-skill`의 `redesign-existing-projects` 스킬을 웹에 적용해 효과를 봤고, 같은 스킬을 모바일에도 적용. 스킬 자체는 웹 CSS 기준이라 RN 방식으로 해석해서 적용(`npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"`로 설치, `.agents/skills/redesign-existing-projects/SKILL.md`).

**진행 순서**: 감사(audit) 결과를 먼저 사용자에게 보여주고 확인받은 후 진행(스킬이 요구하는 절차). **기능 로직은 전혀 안 건드리고 스타일 레이어만 수정.**

**적용한 것**
1. **타이포 헤드라인 존재감**: 로그인/회원가입/마이페이지/모집·커뮤니티 상세 제목을 `text-2xl~xl font-bold` → `text-2xl~3xl font-extrabold tracking-tight`로. 한글 폰트 파일 번들링(Pretendard 등)은 비용 대비 효과가 낮다고 판단해 스킵, 사이즈/굵기 축으로만 처리.
2. **"테두리+흰배경" 제네릭 카드 탈피 + 색 앵커**: 웹의 `avatar-tone.ts`(닉네임 해시 → 3톤 순환) 로직을 `src/lib/avatar-tone.ts`로 이식, 이니셜 아바타 컴포넌트(`src/components/avatar.tsx`) 신설. 커뮤니티 목록/상세/댓글에 작성자 아바타 적용. 카드 배경을 `border border-gray-100` → `border-0 bg-gray-50`(옅은 배경 톤만으로 경계 표현)로 전환(모집/커뮤니티 리스트, 마이페이지 3개 섹션, 댓글 아이템).
   - 모집 리스트/상세는 목록 API에 작성자 정보가 없어서(웹 쿼리 확인) 아바타 대신 모집 타입(DEV/PLAN)별 색 배지(`sky`/`emerald`)로 시각 앵커 대체.
   - 모집 상세에 원래 화면에 없던 작성자(아바타+닉네임+작성일) 표시 추가 — 데이터는 이미 API에 있었는데 화면에 안 그리고 있었음(웹은 표시하고 있어서 맞춤).
3. **레이아웃 여백**: 리스트 `gap-3`→`gap-4`, 카드 패딩 `p-4`→`p-5`(리스트)/`px-3 py-3`→`px-4 py-3.5`(마이페이지 행), 상세 화면 섹션 간격도 소폭 확대.
4. **아이콘 통일**: 커뮤니티 좋아요의 이모지(❤️/🤍)를 `@expo/vector-icons`(Ionicons `heart`/`heart-outline`)로 교체 — 탭 아이콘과 같은 벡터 아이콘 체계로 통일. 댓글 수도 `chatbubble-outline` 아이콘 추가.
5. **상세 화면 로딩 상태**: 모집/커뮤니티/마이페이지 상세의 원형 스피너(`ActivityIndicator`)를 실제 레이아웃 모양을 닮은 스켈레톤(회색 블록)으로 교체 — 목록 화면은 원래도 스켈레톤이라 통일.

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 둘 다 통과. 생성된 CSS에서 새로 쓴 `bg-sky-100`/`bg-emerald-100` 등도 정상 컴파일 확인.

**다음 할 일**:
- [ ] 실기기에서 스크린별 확인 — 특히 카드 배경 톤 변화, 아바타 색상, 헤드라인 크기가 의도대로 보이는지.

---

## 2026-08-27 (4) — 모집글/커뮤니티글 삭제 기능 추가

**배경**: 웹에 작성자 본인 삭제 기능(`DELETE /api/recruit/[id]`, `DELETE /api/community/[id]`)이 새로 생겨서, 모바일에도 동일하게 붙임.

**추가한 것**
- `src/lib/api-client.ts`: `apiDelete` 헬퍼 추가.
- `src/features/recruit/{api,mutations}.ts`, `src/features/community/{api,mutations}.ts`: `deleteRecruit`/`deleteCommunityPost` + `useDeleteRecruit`/`useDeleteCommunityPost` 뮤테이션. 성공 시 관련 목록(`recruit-list`/`community-list`)과 `dashboard` 쿼리 무효화.
- `src/features/community/types.ts`: `CommunityPostDetail`의 `author`에 `id` 추가(목록 응답은 `nickname`만 오지만 상세는 웹이 `id`도 내려줌 — 삭제 버튼 노출 여부 판단에 필요, 웹 소스(`getCommunityPostById`) 직접 확인 후 반영).
- **모집 상세 / 커뮤니티 글 상세**: 작성자 본인일 때만(`recruit.author?.id === session.user.id`) 제목 옆에 "삭제" 버튼(`variant="destructive"`) 노출. `Alert.alert` 확인 다이얼로그 후 삭제, 성공하면 `router.back()`으로 이전 화면 복귀.
- **마이페이지**: 그동안 화면에 아예 안 그려지고 있던 `myRecruits`(내 모집글)·`myPosts`(내 작성글) 섹션을 신설(원래 API엔 있었는데 화면에 안 쓰고 있었음) — 각 행에 삭제 버튼. 전체 화면을 `ScrollView`로 바꿔 섹션 3개(내 모집글/내 작성글/지원한 모집)를 한 화면에 배치.
- `docs/api-contract.md`: `DELETE /api/recruit/[id]`, `DELETE /api/community/[id]` 문서화.

**Realtime과의 관계**: 모집 목록은 이미 `Recruit` 테이블 전체 이벤트를 구독 중이라 삭제도 자동으로 목록에서 빠짐 — 그와 별개로 삭제한 화면에서 지연 없이 바로 보이도록 뮤테이션 성공 시에도 명시적으로 `invalidateQueries` 호출(중복이지만 즉시성 보장 목적, 해롭지 않음).

**검증**: `npx tsc --noEmit`, `npx expo export --platform web` 둘 다 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 본인 글에만 삭제 버튼 보이는지, 삭제 후 목록/마이페이지에서 바로 빠지는지, 다른 계정 글엔 버튼 자체가 안 보이는지.

---

## 2026-08-27 (3) — 좋아요 취소 등 DELETE Realtime 이벤트 누락 — 확인만, 코드 수정 없음

**신고된 증상**: 웹에서 좋아요 취소하면 모바일에 반영 안 됨(좋아요 누르는 건 정상 반영).

**원인(웹 쪽에서 이미 확정·수정)**: `CommunityPostLike`/`Comment`/`Recruit`/`Application` 테이블의 `REPLICA IDENTITY`가 기본값(PK만)이라, DELETE 이벤트의 `old record`에 PK 외 컬럼(`postId` 등)이 안 들어옴. `useCommunityDetail`의 구독 필터(`postId=eq.<id>`)가 그 값을 요구하는데 없으니 Realtime 서버가 필터 매칭 자체를 못 해서 이벤트가 클라이언트까지 안 왔던 것. 웹이 4개 테이블 전부 `REPLICA IDENTITY FULL`로 변경 완료(Supabase에서 `relreplident = 'f'` 직접 확인).

**모바일 쪽 검토 결과 — 코드 수정 불필요**:
- `useCommunityDetail`(좋아요/댓글): 필터가 요구하던 값이 이제 채워지므로 DB 수정만으로 저절로 해결됨.
- `useRecruitList`(모집 목록): 애초에 필터 없이 전체 이벤트 구독이라 REPLICA IDENTITY와 무관하게 삭제도 원래 정상 반영되고 있었음.
- `useDashboard`: `Application`은 `UPDATE`만 구독(삭제 기능 자체가 없어서 DELETE는 처리 대상 아님).
- 콜백이 전부 `payload` 내용을 안 읽고 무조건 `invalidateQueries`만 하는 구조라, 우회 로직 같은 것도 원래 없었음(단순화할 것도 없음).

**발견한 별개 이슈 — 의도적으로 안 고치기로 결정**: 커뮤니티 **목록** 화면(`useCommunityList`)엔 Realtime 구독이 아예 없어서 새 글은 pull-to-refresh해야 반영됨. 웹도 이 부분은 실시간이 아니고, "목록에 새 글이 몰래 끼어드는" 것보다 pull-to-refresh가 표준적인 패턴이라는 데 사용자와 합의 — 추가 안 하기로 함.

---

## 2026-08-27 — React Native Reusables(shadcn RN 포트) 도입

**배경**: 지금까지 화면들이 디자인 시스템 없이 NativeWind 클래스로 그때그때 스타일링돼서 화면마다 통일감이 떨어진다는 지적 — 원래 `AGENTS.md`/`rn-pilot-plan.md`에 계획돼 있던 React Native Reusables를 착수 안 하고 있던 상태였음. 이번에 정식 도입.

**설치 과정**
- `@react-native-reusables/cli`(`npx react-native-reusables`가 아니라 이 패키지명)의 `add` 명령으로 `button`, `text`, `card`, `input` 컴포넌트 추가 — `src/components/ui/`에 소스가 그대로 복사되는 방식(shadcn과 동일 철학, npm 라이브러리로 설치되는 게 아님).
- CLI가 인터랙티브 프롬프트(ink 기반)라 이 세션에서 바로 실행하면 멈춘 것처럼 보임 — `yes y |`로 stdin에 답 흘려보내서 해결.
- `doctor` 명령으로 누락된 설정 진단 → 전부 수정:
  - 의존성: `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@rn-primitives/portal`, `@react-navigation/native` 설치(`npx expo install`).
  - `src/lib/utils.ts`(`cn` 헬퍼), `src/lib/theme.ts`(`NAV_THEME` + CSS 변수 대응 JS 팔레트) 신규 작성.
  - `global.css`: shadcn 시맨틱 색 변수(`--primary`, `--background` 등)를 **기존 브랜드 팔레트(amber/ink)에 매핑한 값**으로 추가 — 새 색을 만든 게 아니라 기존 `config/theme.ts` 색을 hsl로 변환해서 그대로 재사용.
  - `tailwind.config.js`: 위 CSS 변수를 참조하는 `primary`/`secondary`/`muted`/`accent`/`destructive`/`border`/`input`/`ring`/`background`/`foreground`/`card`/`popover` 색상 키 추가, `borderRadius`를 `--radius` 변수 기반으로, `tailwindcss-animate` 플러그인 등록.
  - `metro.config.js`: `inlineRem: 16` 추가.
  - `app/_layout.tsx`: `PortalHost` 추가(Dialog/Select 등 포털 렌더링에 필요).
- `npx @react-native-reusables/cli doctor` 최종 "All checks passed." 확인.

**검증**: `npx tsc --noEmit` 통과, `npx expo export --platform web` 에러 없이 번들 성공.

**다음 할 일**:
- [ ] 기존 화면(로그인/회원가입/모집/커뮤니티/마이페이지)의 직접 스타일링된 버튼·카드·인풋을 새 `src/components/ui/` 컴포넌트로 교체할지 결정 — 사용자 확인 후 진행.

---

## 2026-08-27 (2) — 전 화면 컴포넌트 교체 (Button/Text/Input/Card)

**한 것**: "디자인 변화 없이 전부 바꿔달라"는 요청에 따라, 로그인·회원가입·모집(목록/상세)·커뮤니티(목록/상세)·마이페이지 전 화면의 `Pressable`+`RN Text`/`TextInput`을 `src/components/ui/`의 `Button`/`Text`/`Input`/`Card`로 교체. **기존 className은 전부 그대로 유지**하고 태그만 바꿔서 시각적으로는 동일하게 유지(`cn`이 tailwind-merge로 뒤에 오는 className을 우선 적용하므로, 기존 클래스가 항상 새 컴포넌트의 기본 스타일을 덮어씀).

**주의해서 처리한 것 — 컴포넌트 기본 스타일이 몰래 새어나오는 경우**:
- `Button` 기본 variant는 `bg-primary`(amber) + `shadow-sm shadow-black/5`가 항상 깔림 — 원래 배경이 없던 좋아요 버튼(비활성 상태)엔 `variant="ghost"`로 바꿔서 amber가 새는 것 방지, 그 외 버튼들은 전부 `shadow-none`을 명시적으로 추가해서 없던 그림자가 생기는 것 방지.
- `Card` 기본 스타일(`flex-col gap-6 py-6 shadow-sm shadow-black/5 border-border`)이 기존 `p-4`/`flex-row` 레이아웃과 충돌해서, 카드로 바꾼 곳(모집/커뮤니티 리스트 카드, 댓글 아이템, 마이페이지 지원 목록 행)마다 `gap-0`(또는 `gap-2`)·`shadow-none`·`border-0`(테두리 없던 곳)를 명시적으로 덮어써서 기존 여백/그림자/테두리 그대로 유지.

**검증**: `npx tsc --noEmit` 통과, `npx expo export --platform web` 에러 없이 번들 성공. 생성된 CSS에서 `shadow-none`/`gap-0` 등 오버라이드 클래스가 의도대로 컴파일된 것도 확인. 실기기 시각 확인은 아직 — Metro 재연결 후 사용자 확인 필요.

**다음 할 일**:
- [ ] 실기기에서 스크린별로 이전과 똑같이 보이는지 확인(특히 카드 여백·좋아요 버튼·버튼 그림자 유무).
- [ ] 문제없으면 이제부터 새 화면/기능은 처음부터 `src/components/ui/` 컴포넌트로 작성.

---

## 2026-08-26 — 3차 통합 테스트 버그 수정 + 속도 원인 규명(웹), 로컬 전용 문서 폴더

**웹+모바일 통합 테스트(3차)에서 나온 버그 수정**
- **Realtime 채널 이름 충돌 크래시**: `recruit-list` 등 채널명을 고정 문자열로 써서, 이전 화면 인스턴스가 완전히 언마운트되기 전에 같은 이름으로 재구독하면 "cannot add postgres_changes callbacks after subscribe()" 크래시(비로그인 둘러보기 → 로그인 직후 재진입 시 재현). `src/features/recruit/queries.ts`, `src/features/dashboard/queries.ts` 둘 다 채널명을 훅 인스턴스별 고유값으로 변경.
- **커뮤니티 좋아요 연타 오작동**: `isPending`이 리렌더를 기다려야 반영돼서, 빠른 연타 시 토글 요청이 여러 번 겹쳐 나가 최종 상태(하트 1→0)가 꼬이던 문제 — `ref`로 동기 가드 추가(`app/(app)/community/[id].tsx`).
- **커뮤니티 상세 화면에 새로고침 수단 없음**: 웹에서 단 댓글이 반영됐는지 확인할 방법이 없었음 — pull-to-refresh 추가.
- **탭 화면 안 입력창이 키보드에 가려짐 (재발)**: 절대 위치 제거 등 이전 수정으로도 재현돼서 다시 보니, 이 화면이 하단 탭 안에 있어 탭 바가 리사이즈 계산에 계속 끼어드는 게 원인으로 추정 — `tabBarHideOnKeyboard: true`로 키보드 뜨면 탭 바 자체를 숨기도록 변경(`app/(app)/_layout.tsx`).
- **마이페이지 지원 목록 UI 겹침**: `FlatList`에 `flex-1` 누락 + 상태 라벨이 박스 없이 텍스트로만 붙어있던 것 — 칩(pill) 형태로 감싸고 레이아웃 수정.
- **스플래시 → 검정 화면 → 리스트**: `Stack` 기본 배경색 미지정으로 스플래시 직후 잠깐 검정이 보이던 것 — 흰색으로 고정.

**속도 문제 원인 — 웹 쪽에서 규명 완료**: "웹도 모바일도 데이터 통신이 느리다"는 지적의 진짜 원인은 Supabase 커넥션/쿼리가 아니라 **Vercel 함수 리전(`iad1`, 미국)과 Supabase DB 리전(`ap-northeast-2`, 서울) 불일치**였음 — 매 요청마다 태평양 왕복이 깔리고 있었음. 웹이 `vercel.json`에 `regions: ["icn1"]` 추가해 해결(`/api/community` 2.5s → 0.2s, 9~12배 개선), main 배포 완료. 모바일은 이 웹 API를 그대로 호출하는 구조라 자연스럽게 같이 개선됨.

**커뮤니티 좋아요/댓글 Realtime — 논의만, 구현은 다음으로**: pull-to-refresh로는 "당겨야만 안다"는 근본적 한계가 있어 지원 상태·모집 목록처럼 Realtime이 낫다는 데 사용자와 합의. 토큰 부족으로 이번엔 구현 보류 — 웹 쪽에 DB 마이그레이션(RLS+publication) 선작업을 요청하는 핸드오프 프롬프트를 대화로 전달함.

**로컬 전용 문서 폴더 신설**: 개인 테스트 기록처럼 git에 안 올려도 되는 문서를 위해 `docs/local/` 폴더 만들고 `.gitignore` 처리. 기존 3차 테스트 체크리스트를 이쪽으로 이동.

**다음 할 일**:
- [ ] 재테스트: 좋아요 연타, 키보드 가림, 마이페이지 UI, 낙관적 업데이트 체감 속도(리전 수정 반영 후).

---

## 2026-08-27 — 커뮤니티 좋아요/댓글 Realtime 반영

웹 쪽에서 `Comment`, `CommunityPostLike` 테이블에 RLS(누구나 SELECT)+`supabase_realtime` publication 등록 마이그레이션 완료(Supabase에서 직접 확인). 모바일 `src/features/community/queries.ts`의 `useCommunityDetail`에 두 테이블 `postgres_changes` 구독 추가(`postId=eq.<id>` 필터) — 다른 사람이 이 글에 좋아요/댓글 남기면 새로고침 없이 바로 반영. 채널명은 어제 겪은 충돌 크래시 방지 패턴대로 인스턴스별 고유값 사용.

`npx tsc --noEmit` 통과.

**다음 할 일**:
- [ ] 실기기에서 확인: 커뮤니티 상세 화면 열어둔 채로 다른 계정(또는 웹)에서 좋아요/댓글 → 자동 반영되는지.

---

## 2026-08-25 (5) — 커뮤니티 UX 마감 (좋아요 이모지, 댓글 버튼 상태, 키보드 가림)

**실기기 재테스트 피드백 기반 후속 수정**

- **좋아요 표시를 하트 이모지로**: "좋아요 N" 텍스트 대신 ❤️/🤍로 눌림 상태 표시, 버튼처럼 보이도록 개선.
- **댓글 등록 버튼 상태 불명확 → 색으로 명확히 구분**: 기존엔 `disabled:opacity-50`만 써서, 비활성 상태(입력 없음)일 때 주황 버튼이 반투명해져 "옅은 주황색"으로 보이는 게 오히려 헷갈림 유발. 입력 없음/전송 중엔 완전히 다른 색(회색), 입력 있으면 진한 주황으로 바꿔 상태를 명확히 구분.
  - 참고로 댓글 작성 자체는 원래부터 횟수 제한 없음(웹 API에 중복 방지 제약 없음, 한 사용자가 여러 번 작성 가능) — 별도 코드 수정 불필요, 확인만 함.
- **댓글 입력창이 키보드에 가려지는 문제**: 두 차례 시도 끝에 근본 원인 확인 — 입력창을 `position: absolute`로 하단 고정해뒀던 게 `KeyboardAvoidingView`의 리사이즈 계산과 잘 안 맞았음(Android `adjustResize` 기본값과 `height` 모드가 겹치는 문제도 있었음). **최종 수정**: 절대 위치를 없애고 `FlatList`를 `flex-1`, 입력창을 그 아래 일반 flex 자식으로 두는 표준 채팅 UI 레이아웃으로 재구성 — 이제 `KeyboardAvoidingView`가 표준 방식대로만 동작하면 됨.

**다음 할 일 — 내일(2026-08-26) 웹+앱 전체 통합 테스트**
- [ ] 웹(`TeamUp`)과 모바일(`TeamUp-mobile`) 같이 켜놓고 전체적으로 테스트 진행 예정. 체크리스트를 `docs/testing/3차_웹앱_통합테스트_체크리스트.md`로 미리 작성해둠 — 오늘 만든 기능(둘러보기·랜딩 링크·Realtime 2건·커뮤니티·좋아요/댓글 UX) + 웹↔모바일 크로스체크 + 2차 체크리스트 이월 항목 포함.
- [ ] 위 테스트에서 나온 버그는 발견 즉시 이 파일에 새 항목으로 기록 후 수정.

---

## 2026-08-25 (4) — 모집 목록 Realtime 반영

**실기기 테스트 피드백**: 웹에서 새 모집을 올려도 모바일 목록엔 새로고침 전까진 안 보임 — 지원 상태처럼 Realtime이 안 붙어있던 부분.

**수정**: `src/features/recruit/queries.ts`의 `useRecruitList`에 `Recruit` 테이블 `postgres_changes` 구독 추가(`event: "*"` — 생성/수정/상태변경 전부) → 변경 시 `recruit-list` 쿼리 무효화. 모집 목록은 비로그인도 보는 공개 데이터라 로그인 여부와 무관하게 항상 구독.
- **DB 설정**: `Recruit` 테이블에 RLS 활성화 + "누구나 SELECT 가능" 정책 추가(원래도 `GET /api/recruit`가 토큰 없이 공개 응답하던 데이터라 노출 범위 변화 없음) 후 `supabase_realtime` publication에 등록.

**다음 할 일**:
- [ ] 웹에서 모집 새로 등록/상태 변경 → 폰 목록 화면 열어둔 채로 바로 반영되는지 실기기 확인.

---

## 2026-08-25 (3) — 커뮤니티 좋아요 낙관적 업데이트

**실기기 테스트 피드백**: 좋아요 버튼 눌렀을 때 서버 응답 기다리느라 반응이 느리게 느껴짐.

**수정**: `src/features/community/mutations.ts`의 `useToggleCommunityLike`에 `onMutate`로 낙관적 업데이트 추가 — 누르는 즉시 화면부터 뒤집어 보여주고, 실패 시 `onError`에서 원래 상태로 롤백.


---


## 2026-08-25 (2) — 커뮤니티 화면 신설

**배경**: `rn-pilot-plan.md`에 Tier 2(제외)로 분류돼 있던 커뮤니티 기능 — 당시엔 웹에 `/api/community` REST 엔드포인트 자체가 없어서 보류했던 것. 웹에서 새로 API를 만들어 [Scalar 문서](https://registry.scalar.com/share/apis/TiPiGKoGGYUrgvqZbnmHt)로 공유받아 확인 후 진행.

**API 확인**: `GET /api/community`(목록, `tag`/`page` 쿼리), `GET /api/community/[id]`(상세+댓글+`alreadyLiked`), `POST /api/community/[id]/like`(좋아요 토글), `POST /api/community/[id]/comments`(댓글 작성). **글 작성(POST) 엔드포인트는 아직 없음** — 조회·좋아요·댓글까지만 구현.

**추가한 것** (기존 `features/recruit` 구조 그대로 따름):
- `src/features/community/{types,api,queries,mutations}.ts`
- `app/(app)/community/index.tsx` — 태그 필터(전체/아이디어/질문/기타) + 목록, 빈/로딩(스켈레톤)/에러 3상태 처리
- `app/(app)/community/[id].tsx` — 상세 + 댓글 목록 + 좋아요 토글 + 댓글 작성. 비로그인 상태로 좋아요/댓글 시도 시 로그인 화면으로 유도(모집 지원 흐름과 동일 패턴).
- `app/(app)/_layout.tsx`: "커뮤니티" 탭 추가.
- `src/config/labels.ts`: `COMMUNITY_TAG_LABEL`, `COMMUNITY_TAG_FILTERS` 추가(웹 `src/config/labels.ts`에서 복붙).
- `docs/api-contract.md`: 커뮤니티 4개 엔드포인트 문서화(웹 쪽 문서와 동일 내용으로 동기화).

**검증**: `npx tsc --noEmit` 통과. 실기기 테스트는 아직 — 다음 라운드에서 확인 예정(글 작성 없이 조회/좋아요/댓글까지).

**다음 할 일**:
- [ ] 실기기에서 커뮤니티 목록/상세/좋아요/댓글 흐름 확인.
- [ ] 글 작성(POST) API가 추후 생기면 작성 화면 추가 검토.

---

## 2026-08-25 (1b) — 마이페이지 지원 상태 Supabase Realtime 반영

**마이페이지 지원 상태를 Supabase Realtime으로 즉시 반영**
- 기존엔 마이페이지 탭에 다시 들어와야(`useFocusEffect`) 지원 수락/거절 상태가 갱신됐음(최대 60초 `staleTime` + 포커스 시점 의존). Gmail처럼 화면을 안 만져도 바로 반영되길 원해서 Supabase Realtime 도입.
- **DB 설정(Supabase 프로젝트, 1회성 마이그레이션)**: `Application` 테이블 RLS 활성화 + "본인 행만 SELECT 가능" 정책 추가(`auth.uid() = "applicantId"`) 후 `supabase_realtime` publication에 등록. 웹의 Prisma 연결은 `postgres` 역할(`rolbypassrls = true`)이라 RLS 추가가 웹 동작에 영향 없음을 사전 확인.
- **모바일**: `src/features/dashboard/queries.ts`에 `postgres_changes` 구독 추가 — 내 `applicantId`로 필터링된 `Application` UPDATE 이벤트 수신 시 `queryClient.invalidateQueries(["dashboard"])`. 웹 API/Server Action 코드는 전혀 변경 없음(Realtime은 Postgres WAL을 Supabase가 직접 감시하는 관리형 서비스라 서버 코드 개입 불필요).
- 기존 `useFocusEffect` 강제 refetch는 폴백으로 유지(구독 연결 전 진입 시 등 대비).

**다음 할 일**:
- [ ] 웹에서 지원 수락 처리 → 폰 마이페이지 화면 열어둔 채로 바로 반영되는지 실기기 확인.

---

## 2026-08-25 (1a) — 로그인 화면에 웹 랜딩 링크 추가

**로그인 화면에 "서비스 소개 보기" 링크 추가**
- 비로그인 사용자를 위한 별도 랜딩 화면을 새로 만드는 대신, 웹의 기존 랜딩페이지(`API_BASE_URL`)를 시스템 브라우저로 여는 링크로 대체(`Linking.openURL`). 화면 하나 신설·유지보수 부담 없이 "이게 무슨 서비스인지" 설명 요구를 해결. `app/(auth)/login.tsx`.

**다음 할 일**:
- [ ] 새 APK/Metro로 링크 동작 확인.

---

## 2026-08-24 (3) — "둘러보기" UX 적용 + 계정 전환 캐시 버그 수정, 스플래시 재빌드

**로그인 화면 바로 진입 UX 개선 — "둘러보기" 방식으로 결정**
- 논의 끝에 방향 확정: 앱 기본 진입은 그대로 로그인 화면 유지하되, "로그인 없이 둘러보기" 도피구를 추가. `GET /api/recruit`·`GET /api/recruit/[id]`가 원래 토큰 없이도 응답하는 걸 그대로 활용 — 백엔드 변경 없이 프론트만으로 처리 가능했음.
- `app/(app)/_layout.tsx`: 비로그인이면 무조건 로그인으로 리다이렉트하던 하드 가드 제거. 모집 목록/상세는 누구나 접근, 로그인이 실제 필요한 지점(지원·마이페이지)만 화면별로 개별 가드.
- `app/(auth)/login.tsx`: "로그인 없이 둘러보기" 버튼 추가 → `/(app)/recruit`로 이동.
- `app/(app)/dashboard.tsx`: 비로그인이면 API 호출 자체를 안 하고(`useDashboard(enabled)`) "로그인 후 이용할 수 있어요" + 로그인 버튼 노출.
- `app/(app)/recruit/[id].tsx`: 비로그인 상태로 지원하기 누르면 로그인 화면으로 이동, 버튼 문구도 "로그인하고 지원하기"로 구분 표시.

**버그: 다른 계정으로 봐도 이전 계정의 "지원 완료" 상태가 그대로 보임** (실기기에서 발견 — 웹에서 새 모집 만들고 다른 아이디로 모바일에서 확인하니 지원 안 했는데도 "지원 완료"로 표시)
- 원인: `recruit-detail`·`dashboard` 등 React Query 쿼리 키에 "누가 로그인했는지" 구분이 없음. 로그아웃 후 다른 계정으로 들어가도 이전 계정 때 캐시된 응답이 60초 `staleTime` 동안 그대로 노출됨.
- 수정: `app/_layout.tsx`에 `supabase.auth.onAuthStateChange` 리스너 추가 — 로그인/로그아웃(`SIGNED_IN`/`SIGNED_OUT`, 실제 계정이 바뀌는 시점)마다 `queryClient.clear()`로 캐시 전체 초기화. 앱 첫 실행 시 세션 자동 복원(`INITIAL_SESSION`)은 별개 이벤트라 이땐 안 지워지게 구분함(불필요한 재조회 방지).
- 이 둘 다 JS만 변경 — Metro 재연결만 하면 반영, 재빌드 불필요.

**스플래시 로고 재빌드**
- 어제 로고 파일만 교체해뒀던 걸 실제로 반영하려면 네이티브 리소스로 다시 구워야 해서 `eas build -p android --profile development` 실행 → `FINISHED`. 새 APK: `https://expo.dev/artifacts/eas/w8Nj4FKfqAYqD5XW1DURNh4sAOUUg2I1snTnt71_u0s.apk`.
- (참고: JS 변경은 Metro가 실행 중인 JS 엔진에 새 번들을 내려주는 방식이라 즉시 반영되지만, 스플래시 이미지는 OS가 JS 엔진을 띄우기도 전에 그리는 네이티브 리소스라 EAS 빌드로 APK를 다시 구워야만 바뀜 — 이 구분을 헷갈려하셔서 설명함.)

**다음 할 일**:
- [ ] 새 APK 설치 후 재테스트: 스플래시 로고 + 둘러보기 흐름(비로그인 목록/상세 진입, 지원 시도 시 로그인 유도, 마이페이지 접근 시 로그인 유도) + 계정 전환 캐시 버그 재현 안 되는지.
- [ ] 테스트 통과하면 `dev`에 커밋 + push.
- [ ] 여전히 열려있는 것: `GET /api/dashboard` 500(재현 대기), 이메일 필드 영어 에러 메시지(재현 대기), 커뮤니티 화면 모바일 추가 여부(미정), `dev`→`main` 머지 시점, 테스트용 헤드리스 에뮬레이터 정리 여부, 모집/커뮤니티 웹 내비게이션 이슈 웹 에이전트 전달 여부.

**⚠️ 아직 코드 반영 안 함 — 사용자 요청으로 보류**: 실기기에서 마이페이지 `useFocusEffect` 강제 새로고침이 체감상 느림. 지원 수락/거절 후 마이페이지 탭을 3번 정도 왔다갔다 해야 반영되는 걸 확인(사용자 리포트, 2026-08-24 오후). 코드 버그라기보단 매 focus마다 실제 네트워크 요청이 나가는데 Vercel 콜드스타트/네트워크 지연 시 `retry: 1`로는 부족해서 여러 번 재시도해야 성공하는 것으로 추정 — 확정 원인 아님, 재현 패턴 더 관찰 필요. 개선 후보: 새로고침 중임을 보여주는 로딩 인디케이터 추가, retry 횟수 조정. **사용자가 "코드는 아직 올리지 말라"고 명시함 — 다음에 착수.**

---

## 2026-08-24 (2) — 헤드리스 에뮬레이터 구축 + 실기기 버그 다수 수정, `dev` 브랜치 전환

**헤드리스 Android 에뮬레이터로 자체 테스트 환경 구축**
- `brew install --cask android-commandlinetools` + arm64 시스템 이미지(API 34)로 Android Studio 없이 커맨드라인만으로 에뮬레이터 세팅(`teamup-test` AVD). `adb`/`uiautomator dump`로 좌표 잡아 화면 조작·`screencap`으로 캡처하는 방식으로 셀프 테스트 진행.
- `-gpu swiftshader_indirect`(소프트웨어 렌더링)가 리소스 제약으로 ANR(`System UI isn't responding` 등)을 반복적으로 일으킴 — `-gpu off`는 화면 자체가 안 그려져서(screencap 항상 검정) 대안 안 됨. 결국 swiftshader로 유지하되 재시작으로 회복하는 방식으로 운용. 이 불안정성은 **테스트 환경 자체의 한계**이며 앱 코드와 무관.
- scrcpy로 실시간 미러링도 시도했으나 장시간 구동으로 인한 고부하(load average 9.6)로 입력이 씹히는 현상 발생 — 에뮬레이터 종료로 정리.

**지원 상태 관련 버그 재검증** — 웹 레포에서 `updateTag`→`revalidateTag` 근본 수정 배포 후:
- `curl`로 프로덕션 직접 검증(`alreadyApplied: true`, `POST /api/applications` → 201 정상) + 앱에서 완전히 새 모집에 지원해 에러 없이 "지원 완료" 전환 확인. 두 버그 다 해결 완료.

**실기기(사용자 폰)에서 발견된 버그 다수 수정** (`docs/testing/2차_알파테스트_체크리스트.md` 기반):
- `app/(auth)/login.tsx`, `signup.tsx`: `KeyboardAvoidingView`+`ScrollView` 미적용으로 키보드가 비밀번호 입력란을 가려 스크롤 불가능하던 문제 수정.
- 같은 화면: 필드 재입력 시 이전 제출의 `serverError`가 안 지워져 zod 에러와 서버 에러가 동시에 뜨던 문제 — `onChangeText`에서 `serverError` 클리어하도록 수정.
- `src/features/auth/api.ts`: Supabase가 계정 열거 공격 방지로 이미 가입된 이메일도 에러 없이 "성공"처럼 응답하는 것 때문에 중복가입이 그냥 통과되던 문제 — `data.user.identities.length === 0`(공식 문서 판별법)로 감지해 "이미 가입된 이메일입니다" 에러 처리.
- `src/features/dashboard/queries.ts`: 마이페이지가 60초 `staleTime` 캐시 때문에 지원 수락/거절(모집 작성자가 바꾸는 상태) 반영이 늦던 문제 — `useFocusEffect`로 탭 진입 시마다 강제 `refetch()`.
- `app/(app)/_layout.tsx`: 하단 탭 아이콘이 깨진 상자로 보이던 원인 특정 — `tabBarIcon` 자체를 설정 안 해서 React Navigation의 `MissingIcon` placeholder가 뜨고 있었음(이미지 로딩 실패 아님). `@expo/vector-icons`(Ionicons) 설치해 아이콘 추가.
- `assets/splash-icon.png`: 임시 플레이스홀더 대신 웹 실제 브랜드 로고(`~/Desktop/TeamUp/public/brand/logo-symbol.png`, 180×180)로 교체. **네이티브 에셋이라 EAS 재빌드 전엔 폰에 반영 안 됨.**
- `src/lib/api-client.ts`, `src/lib/query-client.ts`: API 실패·응답 파싱 실패·React Query 에러를 콘솔에 로깅하도록 추가(이전엔 콘솔 로그가 코드에 단 한 줄도 없어서 devtools가 항상 비어 보였음).

**조사했지만 재현/확정 못 한 것**:
- `GET /api/dashboard` 500(빈 응답, "데이터 껐다 켰다" 시점) — 코드엔 지난번 `updateTag` 같은 버그 패턴 없음 확인. 네트워크 재연결 중 응답이 끊긴 것으로 추정, 안정된 네트워크에서 재현되면 재조사 필요.
- 회원가입 이메일 필드 blur 시 영어 에러 메시지 — zod 스키마+`zodResolver` 직접 테스트해보면 한글 정상 출력됨. Android 키보드(Gboard) 자체 자동완성 힌트일 가능성.

**범위 확인 (버그 아님)**:
- 모집 목록에 커뮤니티 글이 섞인다는 보고 → 코드 확인 결과 안 섞임. 실제론 "모바일에 커뮤니티 화면 자체가 없음"을 말한 것 — `rn-pilot-plan.md`에 원래 Tier 2 제외 항목으로 의도된 범위임을 확인.
- 로그인 화면으로 바로 진입하는 UX, 모바일 글 등록(모집 생성) 화면 — 둘 다 사용자와 논의 후 **보류/범위 유지**로 결정.

**브랜치 전략 변경**: 앞으로 이 레포는 `main` 대신 `dev` 브랜치에서 작업. 위 내역 전부 `dev`에 커밋(`959966d`) + push 완료, `main`은 안 건드림.

**다음 할 일**:
- [ ] 폰에서 재테스트 (Metro 재연결만 하면 스플래시 제외 전부 반영됨).
- [ ] 통과하면 스플래시 로고 반영을 위해 `eas build -p android --profile development` 재빌드.
- [ ] `dev` → `main` 머지 시점은 추후 결정.

---

## 2026-08-24 — 지원 상태 미표기 버그 (실기기 발견)

**증상**: 실기기(Android dev build)에서 모집 상세 → 지원하기 시 "지원 처리 중 오류가 발생했습니다" 뜨거나, 이미 지원한 모집인데 "지원하기" 버튼이 계속 활성 상태로 보임.

**원인**
- `app/(app)/recruit/[id].tsx`의 "지원 완료" 여부가 **화면 로컬 `useState`만으로 관리**되고 있었음 — 서버에서 지원 여부를 내려주지 않으니, 화면을 다시 열거나(리스트→상세 재진입) 앱을 재시작하면 이미 지원했어도 항상 `false`로 초기화됨.
- 그 상태로 다시 "지원하기"를 누르면 `POST /api/applications`가 `@@unique(applicantId, recruitId)` 위반으로 400을 반환하는데, 웹 API가 그 에러를 뭉뚱그려 "이미 지원했거나, 지원 처리 중 오류가 발생했습니다."로만 응답 — 사용자 입장에선 "버그로 지원이 안 되는" 것처럼 보임.
- 웹(`TeamUp`) 자체 페이지(`src/app/recruit/[id]/page.tsx`)엔 이미 `getApplicationForUser`로 지원 여부를 조회해 `alreadyApplied`로 내려주는 로직이 있었는데, RN이 호출하는 REST 라우트(`/api/recruit/[id]`)에만 이게 빠져 있었음.

**수정 (웹 `~/Desktop/TeamUp` + 모바일 둘 다)**
- 웹 `src/app/api/recruit/[id]/route.ts`: `getUserFromRequest` + 기존 `getApplicationForUser`를 재사용해 응답에 `alreadyApplied: boolean` 추가(비로그인 시 항상 `false`). 로직 재사용 원칙 유지 — 새 쿼리 만들지 않고 웹이 이미 쓰던 걸 그대로 씀.
- 웹 `src/app/api/applications/route.ts`: 지원 실패 시 Prisma `P2002`(unique 위반)를 구분해 "이미 지원한 모집입니다."로 명확한 메시지 반환, 그 외 진짜 서버 오류만 "지원 처리 중 오류가 발생했습니다."로 분리.
- `docs/api-contract.md`(웹·모바일 양쪽 동일 파일이라 둘 다 갱신): `GET /api/recruit/[id]` 응답에 `alreadyApplied` 필드 문서화.
- 모바일 `src/features/recruit/types.ts`: `Recruit` 타입에 `alreadyApplied: boolean` 추가.
- 모바일 `app/(app)/recruit/[id].tsx`: 로컬 `useState`로 관리하던 "지원 완료" 상태 제거, `recruit.alreadyApplied || applyMutation.isSuccess`로 서버 값 기반 파생 상태로 교체. 화면 재진입·앱 재시작해도 서버가 아는 지원 여부와 항상 일치.

**검증**
- 모바일 `npx tsc --noEmit` 통과, 웹 `npx tsc --noEmit` 통과.
- 웹 쪽 관련 테스트 파일에 옛 에러 메시지("이미 지원했거나...") 참조하는 테스트 없음 확인(grep) — 메시지 문구 변경으로 인한 테스트 깨짐 없음.
- 실기기 재확인은 사용자 몫(다음 dev build 배포 후).

**다음 할 일**
- [ ] Android dev build로 실제 지원 → 재진입 시 "지원 완료" 유지되는지 최종 확인.
- [ ] 웹 `~/Desktop/TeamUp` 쪽 변경도 커밋 필요(별도 레포, 아직 커밋 안 함).

---

## 2026-08-21 (4) — 스플래시 스크린 + Android dev build 준비

**한 일**
- `npx expo install expo-splash-screen expo-dev-client` — SDK 57 호환 버전 자동 설치.
- `app.json`: `expo-splash-screen` config plugin 추가. `image: assets/splash-icon.png`(기존 1024x1024 재사용), `imageWidth: 180`, `resizeMode: "contain"`, `backgroundColor: "#FFF4E3"`(DESIGN.md 앰버 소프트 톤). 웰컴/온보딩 문구·버튼 없음, 순수 스플래시만.
- `app/_layout.tsx`: 모듈 스코프에서 `SplashScreen.preventAutoHideAsync()` 호출, 루트에서 `useSession()`의 `isLoading`이 `false`가 되는 시점에 `hideAsync()` — 세션 판별 전엔 스플래시가 화면을 덮고 있어 로그인/목록 판단 깜빡임 없음.
- `eas.json`: `development` 빌드 프로필 신설 — `developmentClient: true` + `distribution: internal` + `android.buildType: apk`. 기존 `internal`(비-dev-client APK)·`production` 프로필은 유지.

**검증**
- `npx tsc --noEmit` 통과.
- `npx expo export --platform web` / `--platform android` 둘 다 정상 번들(각 995~1079 / 1777 모듈, 에러 없음) — reanimated 4·worklets·screens 등 New Arch 네이티브 모듈 조합이 번들 단에서는 문제 없음을 확인. 실제 네이티브 동작은 실기기 dev build에서만 최종 확인 가능(샌드박스에 Android 기기·에뮬레이터 없음).

**사용자 조치 필요 (내가 대신 할 수 없는 부분)**
- [ ] `npx eas-cli login`으로 Expo 계정 로그인 (인터랙티브 — 이 세션에서 대신 못 함).
- [ ] 최초 `eas build` 실행 시 EAS 프로젝트 미연결이면 CLI가 프로젝트 생성/연결을 물어봄 → 진행.
- [ ] EAS 빌드 크레딧/요금제 확인 (무료 티어는 월 빌드 횟수 제한 있음).
- [ ] Android 서명: internal/development distribution은 EAS가 자동으로 debug/adhoc 키스토어를 관리해줌(최초 빌드 시 "Generate new keystore?" 물어보면 Yes) — 스토어 배포용 release 서명은 이 단계에서 불필요.
- [ ] Supabase 대시보드 → Authentication → URL Configuration에 `teamup://` 리다이렉트 허용 확인. 이메일 인증(컨펌 메일) 켜져 있으면 기본 리다이렉트가 웹 URL이라 폰에서 딥링크로 앱에 안 돌아올 수 있음 — 이메일 확인 없이 바로 로그인되는 계정으로 우선 테스트 권장.

**다음 할 일**
- [ ] `eas build -p android --profile development`로 클라우드 APK 빌드.
- [ ] 빌드 완료 링크(QR)로 폰에 APK 설치.
- [ ] `npx expo start --dev-client`로 Metro 붙여서 스플래시 → 모집 목록(실데이터) → 상세 → 로그인 → 지원까지 실기기 확인.

---

## 2026-08-21 (3) — 웹 콘솔 에러: NativeWind darkMode "media" 크래시

**증상**: (2) 수정 후 실제 브라우저 콘솔 확인 결과, 아래 에러가 부팅 시 발생.
```
[Error: Cannot manually set color scheme, as dark mode is type 'media'.
Please use StyleSheet.setFlag('darkMode', 'class')]
  at color-scheme.js:46
```

**원인**
- `tailwind.config.js`에 `darkMode`를 지정하지 않아 Tailwind 기본값 `"media"`로 컴파일됨 (nativewind preset의 `darkModeAtRule`이 `--css-interop-darkMode: media` 플래그를 CSS에 심음, `node_modules/nativewind/dist/tailwind/dark-mode.js`).
- 웹에서 `react-native-css-interop`의 `runtime/web/color-scheme.js`가 이 플래그를 `MutationObserver`로 감지하자마자 내부적으로 `colorScheme.set(...)`을 호출하는데, `.set()` 구현이 `darkMode === "media"`면 무조건 `throw`하도록 되어 있음 → 앱이 직접 호출한 코드가 아니라 **NativeWind 웹 부트스트랩 자체의 버그성 동작**.
- `npx expo start --web` 프로세스를 백그라운드로 띄우고 `curl`로 index.html·JS 번들을 직접 받아 확인 — Metro 번들링 자체는 에러 없이 정상(995~1079 모듈), 즉 순수 런타임(브라우저 실행 시점) 문제였음을 재확인.

**수정**
- `tailwind.config.js`에 `darkMode: "class"` 추가. (`--css-interop-darkMode`가 `class dark`로 컴파일되는 것을 번들 grep으로 확인 완료.)

**검증**
- 수정 후 재빌드된 JS 번들에서 `css-interop-darkMode: class dark` 확인.
- `npx tsc --noEmit`, `npx expo export --platform web` 정상.

---

## 2026-08-21 (2) — 웹 미리보기 런타임 크래시 수정

**증상**: `npx expo start --web` 실행 시 앱 부팅 직후부터 런타임 에러 다수.

**원인 파악**
- `npx tsc --noEmit` 통과 + `npx expo export --platform web`도 995 모듈 정상 번들 → 타입/번들 설정 문제 아님, 런타임 문제로 확정.
- `src/server/supabase.ts`가 세션 저장소로 `expo-secure-store`를 무조건 사용. 그런데 `expo-secure-store`는 웹에서 네이티브 모듈이 없어 `ExpoSecureStore.web.ts`(빈 객체 `{}`)로 리졸브됨 → `getValueWithKeyAsync` 등이 `undefined`.
- `app/index.tsx`·`app/(app)/_layout.tsx`가 앱 부팅 즉시 `useSession()` → `supabase.auth.getSession()` → `SecureStoreAdapter.getItem` → `SecureStore.getItemAsync` 호출 경로를 타서, 웹에서 부팅하자마자 `TypeError: ExpoSecureStore.getValueWithKeyAsync is not a function` 크래시(다수 발생: 초기 세션 조회 + 이후 auth 상태 변경마다 재호출).

**수정**
- `src/server/supabase.ts`: `Platform.OS === "web"`일 때만 메모리 기반(Map) storage 어댑터를 쓰도록 분기, 네이티브(iOS/Android)는 기존 `expo-secure-store` 그대로 유지. (AGENTS.md 금지 규칙은 "네이티브에서 localStorage 쓰지 말 것"이 취지라 `localStorage` 대신 인메모리 어댑터로 구현 — 웹은 화면 확인용이라 세션 영속 불필요.)

**검증**
- `npx tsc --noEmit` 통과, `npx expo export --platform web` 재번들 정상.
- 샌드박스 환경 제약상 `npx expo start --web`(장시간 dev 서버)을 직접 띄워 브라우저 콘솔까지 확인은 못 함 — 사용자 환경에서 재확인 필요.

**다음 할 일**
- [ ] 사용자 로컬에서 `npx expo start --web` 재실행해 에러 사라졌는지 최종 확인.
- [ ] 나머지는 이전 항목과 동일(하단 참고).

---

## 2026-08-21 — 프로젝트 문서 세팅

**한 일**
- 모바일 레포에 `docs/` 신설 + 규칙 문서 정비 (기존엔 CLAUDE.md/AGENTS.md가 사실상 비어 있었음).
  - `AGENTS.md` 재작성 — Expo 57 주의, RN용 아키텍처 원칙(React Query·secure-store·웹 API 소비), 폴더구조, 하지말것, 실행/배포법.
  - `docs/` 구성: `PRD.md`·`SCHEMA.md`·`api-contract.md`·`rn-pilot-plan.md` = 웹에서 복사(공유), `ARCHITECTURE-mobile.md`·`DESIGN.md`·`STATES.md` = RN 맥락으로 재작성.
  - `CLAUDE.md`는 `@AGENTS.md` 임포트 유지(두 도구 단일 소스).

**현황**
- Expo SDK 57 / RN 0.86 / New Arch. 스캐폴딩 완료(app 라우트 그룹 + src 골격).
- 실기기 테스트 이슈: 폰 Expo Go가 SDK 54까지만 지원 → 57 프로젝트 "incompatible". 실기기는 EAS development build(Android APK)로 가야 함.
- 웹 미리보기(`npx expo start --web`)는 `react-native-web`·`react-dom` 설치 필요.

**다음 할 일**
- [ ] `npx expo install react-native-web react-dom` 후 웹 미리보기로 화면 확인.
- [ ] 웹 레포에 `/api/*` REST(`api-contract.md` 기준) 실제로 있는지 점검, 없으면 웹에서 먼저 신설.
- [ ] 척추 화면 구현 (로그인→목록→상세→지원). `rn-pilot-plan.md` Tier 0.
- [ ] EAS internal 빌드로 Android 실기기 테스트.
