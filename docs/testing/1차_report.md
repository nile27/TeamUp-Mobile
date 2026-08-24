# 1차 테스팅 리포트 — Android (헤드리스 에뮬레이터 + 실제 프로덕션 API)

> 날짜: 2026-08-24
> 대상: EAS development build (`b0dc7109-fcf2-44f5-abb7-c78e0c0d2366`) + `npx expo start --dev-client`
> API: `https://team-up-olive.vercel.app`(프로덕션, 더미 데이터 아님) + 실제 Supabase 프로젝트
> 계정: `test_2@gmail.com`(테스트 계정)

---

## 1. 테스트 환경

실기기가 없어 이 세션에서 직접 만든 환경:

- `brew install --cask android-commandlinetools` — Android SDK 커맨드라인 도구만 설치(Android Studio 미설치)
- `sdkmanager`로 `platform-tools` · `emulator` · `system-images;android-34;google_apis;arm64-v8a`(Apple Silicon 네이티브) 설치
- `avdmanager`로 AVD(`teamup-test`, pixel_6 프로필) 생성
- `emulator -avd teamup-test -no-window -gpu swiftshader_indirect`로 헤드리스 부팅
- EAS에 이미 있던 development build APK를 다운로드해 `adb install`
- `npx expo start --dev-client` → dev-client 앱에서 `http://localhost:8090`으로 수동 연결
- 화면 확인은 `adb exec-out screencap`, 조작은 `adb shell input tap/text` + `uiautomator dump`로 정확한 좌표 확보

**환경 자체의 한계(앱 코드와 무관)**: 이 헤드리스 소프트웨어 렌더링(SwiftShader) 환경은 리소스 제약으로 `System UI isn't responding` / `Process system isn't responding` ANR이 반복적으로 발생했음. GPU 완전 비활성화(`-gpu off`)는 화면 자체가 안 그려지는(screencap이 항상 검은 화면) 문제가 있어 다시 `swiftshader_indirect`로 되돌림. 이건 실기기에선 발생하지 않을 이 테스트 환경 특유의 현상.

---

## 2. 확인된 것 (정상 동작)

| 항목 | 결과 |
|---|---|
| 앱 설치 · dev-client 연결 · Metro 번들링 | 정상 (1941 모듈) |
| 커스텀 스플래시 스크린 (`#FFF4E3` 배경) | 정상 렌더링, 깜빡임 없이 다음 화면 전환 |
| 세션 없음 → 로그인 화면 리다이렉트 | 정상 |
| 로그인 폼 (이메일/비밀번호, 앰버 버튼, 에러 표시 영역) | 디자인 토큰(`#FFA940`/`#2B2620`) 그대로 반영, 정상 |
| Supabase Auth 로그인 (`test_2@gmail.com`) | 성공 |
| 모집 목록 — **프로덕션 실데이터** 노출 | 정상 (기술스택 필터 칩, 카드 UI 포함) |
| 모집 상세 — 완성도 게이지 · 기술스택 · 모집 역할 | 정상 |
| 지원 완료 후 마이페이지("지원한 모집") 목록 반영 | 정상 — 서버에 실제로 지원 레코드 생성됨 확인 |
| 로그아웃 → 세션 재부팅 → dev-client 재연결 | 정상 |

세션이 끊긴 뒤 앱을 강제 종료(`am force-stop`)하고 재실행해도 Supabase 세션(secure-store)이 유지되어 재로그인 없이 목록으로 바로 진입 — 세션 저장 정상 동작 확인.

---

## 3. 발견된 버그

### 🔴 버그 1 — 지원 완료 후에도 "지원하기" 버튼이 그대로 뜸 (확정, 원인 특정됨)

**증상**: `test_2@gmail.com`으로 특정 모집에 지원 성공(마이페이지에 "대기 중"으로 정상 표시됨)했는데, 같은 모집 상세 화면을 다시 열어도 "지원 완료"가 아니라 "지원하기" 버튼이 계속 노출됨. 앱을 완전히 재시작(`force-stop` → 재실행 → 재로그인 없이 세션 유지)한 뒤 같은 모집을 다시 열어도 동일하게 재현 — 화면 상태 캐싱 문제가 아니라 서버 응답 자체가 원인.

**원인**: 지난 세션에서 이 버그를 고치기 위해 웹 레포(`~/Desktop/TeamUp`)의 `src/app/api/recruit/[id]/route.ts`에 `alreadyApplied` 필드를 추가했는데(`getApplicationForUser` 재사용), **이 수정이 로컬에만 있고 커밋·배포가 안 된 상태**였음.

```
$ cd ~/Desktop/TeamUp && git status --short
 M src/app/api/recruit/[id]/route.ts   ← 커밋 안 됨
 M src/app/api/applications/route.ts   ← 커밋 안 됨
```

즉 모바일 앱이 실제로 호출하는 `https://team-up-olive.vercel.app/api/recruit/[id]`(프로덕션)은 여전히 예전 코드로 응답하고 있어서 `alreadyApplied` 필드 자체가 없음 → 모바일 쪽 `recruit.alreadyApplied || applyMutation.isSuccess` 계산에서 `alreadyApplied`가 `undefined`가 되어 새로고침할 때마다 "지원하기"로 보임.

**조치 필요**: 웹 레포(`~/Desktop/TeamUp`)에서 해당 커밋 → push → Vercel 배포 완료 후 재테스트.

**✅ 재테스트 결과 (2026-08-24, 웹 재배포 후)**: 해결 확인.
- `curl`로 프로덕션 `/api/recruit/[id]`에 이 계정의 실제 액세스 토큰을 넣어 직접 검증 → `"alreadyApplied": true` 정상 응답.
- 앱에서도 완전 재시작(`force-stop` → 재실행) 후 같은 모집 상세 재진입 → **"지원 완료"로 정상 표시, 버튼 비활성화** 확인.
- 참고: `src/lib/query-client.ts`의 `staleTime: 60 * 1000` 때문에 배포 직후 60초 이내 재방문 시 캐시된 이전 응답이 그대로 보일 수 있음(실제 버그 아님, 정상 캐싱 동작) — 확인 시 앱을 완전 재시작하거나 60초 이상 지난 뒤 확인할 것.

---

### 🔴 버그 2 — 지원 성공했는데 클라이언트에 "지원 처리 중 오류가 발생했습니다" 노출 (확정, 원인 특정 및 수정 완료)

**증상**: 지원하기를 눌렀을 때 화면엔 빨간 글씨로 "지원 처리 중 오류가 발생했습니다"가 떴지만, 실제로는 서버에 지원이 정상 생성됨(마이페이지·`alreadyApplied`로 확인).

**재현/검증**: 웹 API를 `curl`로 직접 호출해 **3번 모두 100% 재현**됨 — 서로 다른 3개 모집(`seed-recruit-8/9`, 앱에서 테스트한 `seed-recruit-10`)에 대해 매번:
- `POST /api/applications` 응답이 **`HTTP 500`, `content-length: 0`(빈 본문)**
- 그런데 직후 `GET /api/recruit/[id]`로 확인하면 `alreadyApplied: true`, `_count.applications` 증가 — **DB엔 이미 정상 저장됨**

**원인**: `src/app/api/applications/route.ts`에서 `prisma.application.create()`(지원 생성)는 try/catch로 잘 감싸져 있지만, 그 아래 `updateTag(`recruit-${recruitId}`)` 캐시 무효화 호출이 **try/catch 밖에** 있었음. 지원 생성은 성공했는데 `updateTag`가 예외를 던지면 그게 캐치 안 된 채로 라우트 핸들러 전체가 죽어서 Next.js/Vercel이 빈 본문 500을 반환 — 클라이언트(`src/lib/api-client.ts`의 `handleResponse`)는 `res.json()`을 하다가 빈 본문 파싱 실패로 일반 에러를 던지고, 이게 `ApiError`가 아니라서 화면엔 뭉뚱그린 "지원 처리 중 오류가 발생했습니다"만 뜸. 즉 **"서버는 성공, 클라이언트는 실패로 인식"**하는 응답-정합성 버그.

**수정** (`~/Desktop/TeamUp/src/app/api/applications/route.ts`, 로컬만 — 아직 커밋/배포 안 함):
```ts
try {
  updateTag(`recruit-${recruitId}`);
} catch (error) {
  console.error("Recruit cache invalidation failed after application create:", error);
}
return NextResponse.json({ data: application }, { status: 201 });
```
캐시 무효화 실패가 이미 커밋된 지원 생성 응답 자체를 깨뜨리지 않도록 격리.

**✅ 재테스트 결과 (2026-08-24, 웹 재배포 후)**: 완전히 해결됨.
- 웹 개발 에이전트가 근본 원인까지 추적함: `updateTag()`는 **Server Action 전용** API라 Route Handler(`api/applications/route.ts`)에서 부르면 Next.js가 무조건 throw함(`node_modules/next/dist/server/web/spec-extension/revalidate.js`에서 확인). `features/recruit/actions.ts`의 웹 UI용 Server Action은 같은 `updateTag`를 써도 정상 동작하는 이유가 여기 있었음.
- `updateTag` → `revalidateTag(tag, "max")`로 교체해 Route Handler에서도 정상 동작하도록 수정. PR #18 머지 → 배포 완료.
- `curl`로 프로덕션 직접 검증: `POST /api/applications` → **`HTTP 201`에 정상 JSON 본문** (이전엔 빈 본문 500).
- 앱에서 완전히 새로운 모집(`[SEED] 중고거래 안전결제 서비스 개발팀`)에 지원 → **에러 메시지 없이 클릭 즉시 "지원 완료"로 전환** 확인.

---

## 4. 결론 · 다음 할 일

**버그 1, 2 모두 웹 레포 배포 완료 후 재테스트로 해결 확인함.** 로그인 → 모집 목록(실데이터) → 상세 → 지원 → 지원 완료 상태 유지까지 척추 여정 전체가 정상 동작.

- [x] 웹 레포(`~/Desktop/TeamUp`) 두 fix 커밋 → push → Vercel 배포 완료 (PR #18 외 1건, main 머지).
- [x] 배포 후 모바일 재테스트: 지원 완료 상태가 새로고침·앱 재시작에도 유지됨 확인.
- [x] 버그 2(지원 성공했는데 에러로 보임) 재현 여부 확인 → 재배포 후 완전히 해소됨.
- [ ] 이번 세션에서 만든 헤드리스 에뮬레이터(`teamup-test` AVD, `/opt/homebrew/share/android-commandlinetools`)는 계속 남겨둘지, 정리할지 결정 필요 — 디스크 여유 공간 재확인(`diskutil info /`).
- [ ] 실제 물리 기기(폰)에서도 한 번 더 확인 권장 — 이번 테스트는 전부 헤드리스 에뮬레이터 기준이라, 카메라·생체인증 등 진짜 하드웨어 의존 기능은 검증 안 됨(이번 여정엔 해당 없음).
