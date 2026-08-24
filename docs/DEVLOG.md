# DEVLOG.md — 모바일 작업 로그

> 데일리 작업 로그. 작업 끝낼 때 맨 위에 추가. (그날 한 일 · 막힌 것 · 다음 할 일)

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
