# DEVLOG.md — 모바일 작업 로그

> 데일리 작업 로그. 작업 끝낼 때 맨 위에 추가. (그날 한 일 · 막힌 것 · 다음 할 일)

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
