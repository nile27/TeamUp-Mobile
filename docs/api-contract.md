# API 계약 — `/api/*` (RN 앱 & 추후 Spring 이관 기준)

> 웹 화면(SSR/ISR)·Server Action은 그대로 유지. 이 API는 RN 앱(및 향후 다른 클라이언트)이 호출할 얇은 REST 레이어.
> 로직은 `features/*/queries.ts`·`actions.ts`·`lib/`를 재사용 — 라우트에 비즈니스 로직 중복 없음.
>
> **대화형 문서**: 개발 서버 실행 중 `/api-doc`(Scalar, "Try it out" 지원) — 요청 스키마는 `features/*/schema.ts`의 zod를 그대로 변환해 생성(`src/server/openapi/registry.ts`). 스펙 원본은 `/api/openapi.json`. 프로덕션에선 비공개(내부 API 표면 노출 방지).

## 인증

쿠키 세션이 없는 클라이언트(RN 등)는 `Authorization` 헤더로 Supabase access token을 보낸다.

```
Authorization: Bearer <supabase access token>
```

서버는 `server/api-auth.ts`의 `getUserFromRequest`로 토큰을 검증해 `user.id`를 얻는다. 토큰이 없거나 유효하지 않으면 **401** `{ "error": "로그인이 필요합니다." }`.

인증이 필요 없는 GET(목록·상세)은 토큰 없이도 호출 가능.

## 공통 응답 형태

- 성공: `{ "data": ... }`
- 실패: `{ "error": "메시지", "fieldErrors"?: { [field]: string[] } }` — `fieldErrors`는 zod 검증 실패(400) 시에만 포함.

---

## `GET /api/recruit`

모집 목록.

**쿼리 파라미터**
- `stack` (선택): 콤마로 구분된 기술스택 필터. 예: `?stack=React,Node.js`

**응답 200**
```json
{ "data": [ { "id": "...", "type": "DEV", "title": "...", "techStack": ["..."], "roles": [...], "_count": { "applications": 0, "bookmarks": 0 }, ... } ] }
```
(목록 응답엔 `alreadyApplied` 없음 — 상세에서만 포함. `applyToRecruit` 성공 후엔 상세 재조회로 갱신.)

---

## `POST /api/recruit`

모집 생성. **인증 필요.**

**요청 바디** (JSON, `features/recruit/schema.ts`의 `createRecruitSchema`와 동일)
```json
{
  "type": "DEV",
  "title": "제목 (5~60자)",
  "content": "설명 (10자 이상)",
  "techStack": ["React"],
  "roles": [{ "name": "프론트엔드", "count": 2 }],
  "problem": "선택",
  "targetUser": "선택",
  "coreFeatures": "선택",
  "reference": "선택"
}
```

**응답**
- `201` `{ "data": <recruit> }`
- `400` 검증 실패 (`fieldErrors` 포함)
- `401` 미인증

`completeness`는 서버에서 `calcCompleteness`로 계산해 저장(클라이언트가 보내지 않음).

---

## `GET /api/recruit/[id]`

모집 상세 (작성자·역할·지원수·저장수 포함). `Authorization` 헤더로 로그인 상태면 `alreadyApplied`에 내가 이미 지원했는지 포함(비로그인이면 항상 `false`) — 지원 여부는 클라이언트가 판단하지 않고 이 값을 그대로 신뢰할 것.

**응답**
- `200` `{ "data": { ...recruit, "alreadyApplied": boolean } }`
- `404` `{ "error": "모집을 찾을 수 없습니다." }`

---

## `POST /api/applications`

지원. **인증 필요.**

**요청 바디**
```json
{ "recruitId": "...", "message": "선택, 최대 1000자" }
```

**응답**
- `201` `{ "data": <application> }`
- `400` 검증 실패 또는 중복 지원(`@@unique` 위반)
- `401` 미인증

---

## `POST /api/profile`

Supabase Auth 회원가입 직후 Prisma `User` 프로필 레코드 생성(없으면). 웹 signup Server Action 2단계와 동일 로직 — RN은 Auth SDK로 직접 `auth.signUp()` 후 이 엔드포인트로 프로필 생성. **인증 필요.**

**요청 바디**
```json
{ "nickname": "닉네임 (2~20자)" }
```

**응답**
- `200` `{ "data": <user> }` — 이미 존재하면 그대로 반환
- `201` `{ "data": <user> }` — 새로 생성
- `400` 검증 실패 또는 auth 유저에 email 없음
- `401` 미인증

---

## `GET /api/dashboard`

내 모집 / 내 글 / 지원현황. **인증 필요.**

**응답 200**
```json
{ "data": { "profile": {...}, "myRecruits": [...], "myPosts": [...], "myApplications": [...] } }
```

**응답**
- `401` 미인증

---

## 확인 완료 (로컬)

- `GET /api/recruit` → 200, `?stack=` 필터 동작 확인
- `GET /api/recruit/[존재하지 않는 id]` → 404
- `POST /api/recruit`, `POST /api/applications`, `GET /api/dashboard` (토큰 없이) → 401
- `npx tsc --noEmit` 통과
