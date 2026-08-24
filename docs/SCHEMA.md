# SCHEMA.md — 데이터 모델

> ⚠️ **Prisma 6 버전대(^6.19.0) 기준.** schema.prisma에 `url`/`directUrl`을 두는 방식. Prisma 7은 이걸 prisma.config.ts로 옮기고 driver adapter를 요구하므로, 이 스키마 그대로 쓰려면 Prisma 6 유지. (7 설치 시 P1012 에러)

TeamUp 데이터베이스 설계 문서. Prisma + Supabase(PostgreSQL) 기준. 실제 스키마는 `prisma/schema.prisma` 참고.

---

## 확정 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 완성도(completeness) | **저장** (Int 필드) | 목록 정렬·표시 시 매번 계산하면 느림. 작성/수정 시 계산해 저장 |
| 좋아요/북마크 | **Phase 2로 미룸** | MVP 핵심은 매칭. 별도 테이블이라 나중에 추가해도 기존 스키마 영향 없음 |
| 역할(RecruitRole) | **별도 테이블** | 역할별 인원("프론트 1명") 관리 위해. 문자열이면 확장 불가 |
| 임베딩(embedding) | **nullable 필드 미리 확보** | Phase 2 AI 매칭 대비. 지금은 자리만, 나중에 pgvector로 |
| 기술 스택 태그 | **`String[]` 배열** (별도 Tag 테이블 X) | MVP는 문자열 배열로 충분. 카드·필터·매칭에 사용. 정규화(오타 통일·자동완성·인기 태그)가 필요해지면 Phase 2에서 Tag 테이블로 승격 |

---

## 모델 개요

- **User** — 사용자 프로필 (인증은 Supabase Auth, id는 auth.users uuid와 매칭)
- **CommunityPost** — 커뮤니티 글 (가벼운 층, 말머리 태그)
- **Recruit** — 정식 모집 (무거운 층, 개발자/기획자 모집) ← 허브
- **RecruitRole** — 모집이 구하는 역할별 인원
- **Application** — 모집 지원
- **Comment** — 커뮤니티 글 댓글

---

## 관계

```
User ─1:N─ CommunityPost      (한 유저가 여러 글)
User ─1:N─ Recruit            (한 유저가 여러 모집)
User ─1:N─ Application         (한 유저가 여러 지원)
User ─1:N─ Comment             (한 유저가 여러 댓글)

Recruit ─1:N─ RecruitRole      (한 모집이 여러 역할)
Recruit ─1:N─ Application       (한 모집에 여러 지원자)

CommunityPost ─1:N─ Comment    (한 글에 여러 댓글)
CommunityPost ─1:1─ Recruit    (승격 다리, promotedFrom, 선택적)
```

허브는 **Recruit**. User가 작성 · RecruitRole로 역할 분리 · Application으로 지원 · CommunityPost에서 승격돼 들어옴.

---

## 핵심 설계 포인트

### 1. 인증과 프로필 분리
- 인증(비번, 세션, 소셜)은 **Supabase Auth**가 `auth.users`에서 관리
- 우리 `User` 테이블은 앱 데이터(닉네임, bio 등)만. `id`를 auth uuid와 동일하게 맞춤
- Phase 2에서 Spring 전환 시: 이 부분이 Spring Security로 대체됨. `User`에 password 등 인증 필드 추가 예정

### 2. 커뮤니티 → 모집 승격 다리
- `CommunityPost.promotedRecruit` ↔ `Recruit.promotedFrom` (1:1)
- 아이디어 글이 반응 좋으면 정식 모집으로 발전. 원본 글을 참조로 연결
- `promotedFromId`는 unique (한 글은 하나의 모집으로만 승격)

### 3. 기획 완성도
- `Recruit`의 구조화 필드(problem, targetUser, coreFeatures, reference) 채운 정도로 계산
- `completeness` (0~100)에 **저장**. 계산 로직은 `lib/completeness.ts`
- 작성/수정 시 계산해서 저장 → 목록에서 바로 표시·정렬 가능

### 4. 중복 지원 방지
- `Application`에 `@@unique([applicantId, recruitId])` → 같은 사람이 같은 모집에 중복 지원 불가

### 5. Phase 2 대비 (지금은 자리만)
- `Recruit.embedding` (Json?, nullable) — AI 의미 매칭용 임베딩 벡터
- 지금은 미사용. Phase 2에서 Supabase pgvector 확장 켜고 `vector(1536)` 타입으로 마이그레이션
- `Like` 모델 — 주석 처리. 좋아요 기능 추가 시 별도 테이블로 (기존 스키마 영향 없음)

---

## 인덱스

- `CommunityPost`: tag, createdAt (태그 필터 + 최신순)
- `Recruit`: type, status, createdAt (유형 필터 + 상태 + 최신순), techStack (GIN — 스택 태그 배열 필터)
- `Application`: recruitId (모집별 지원자 조회)
- `Comment`: postId (글별 댓글 조회)

---

## Phase 2 전환 메모 (Spring + MySQL)

나중에 백엔드를 Spring + MySQL로 전환할 때:
- Prisma 스키마 → JPA 엔티티 또는 MyBatis 매퍼로 이관
- PostgreSQL 전용(`@db.Uuid`, cuid) → MySQL 호환(UUID/AUTO_INCREMENT)으로 조정
- 관계·인덱스·제약(unique)은 거의 그대로 이식 가능
- 인증: Supabase Auth → Spring Security (User에 인증 필드 추가)
- 복잡 집계(인기 모집, 통계)는 MyBatis에서 **raw SQL 직접 작성** → SQL 실력 어필 포인트
