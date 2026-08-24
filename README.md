# TeamUp-mobile

TeamUp 웹(`../TeamUp`, Next.js)의 핵심 사용자 여정 하나(개발자가 프로젝트 찾아 지원)를 RN으로 확장한 파일럿. React 역량의 모바일 확장 증명(포트폴리오/파일럿) 목적 — 실서비스 대체나 전체 기능 패리티는 목표가 아님.

배경·설계 결정은 웹 레포의 `docs/rn-pilot-plan.md`, `docs/rn-build-prompts.md` 참고.

## 스택

- Expo + Expo Router + TypeScript
- NativeWind(RN용 Tailwind) — 디자인 토큰(앰버 `#FFA940` / 먹 `#2B2620`)은 `tailwind.config.js`, `src/config/theme.ts`
- React Query — 서버 상태
- Supabase JS SDK — Auth (웹과 같은 프로젝트, 계정 공유), 세션은 `expo-secure-store`
- 데이터는 TeamUp 웹의 `/api/*` REST 라우트를 호출 (`src/lib/api-client.ts`). 계약: `../TeamUp/docs/api-contract.md`

## 실행

```bash
npm install
cp .env.example .env   # EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 채우기
npx expo start
```

Expo Go(안드로이드/iOS)로 QR 스캔해 실행. `.env`의 `EXPO_PUBLIC_API_BASE_URL`은 기본값이 배포된 웹(`https://team-up-olive.vercel.app`)이라 로컬 웹 서버 없이도 동작. 로컬 웹(`npm run dev`, 3000번 포트)을 쓰려면 같은 네트워크의 머신 IP로 바꿔줄 것(`localhost`는 실기기/에뮬레이터에서 안 잡힘).

## 폴더 구조

```
app/                 # Expo Router 라우트 (얇게)
├─ _layout.tsx        # QueryClientProvider + 테마
├─ index.tsx           # 세션 보고 (app)/(auth)로 리다이렉트
├─ (auth)/             # login, signup
└─ (app)/              # 인증 가드 + 탭(모집/마이페이지)
src/
├─ features/           # recruit/auth/dashboard — api.ts·queries.ts·mutations.ts
├─ lib/                # api-client, completeness(웹 복붙), query-client
├─ schema/              # zod(웹 features/*/schema.ts 복붙)
├─ server/supabase.ts   # secure-store 세션
└─ config/              # env, 디자인 토큰, 라벨, 기술스택 프리셋(웹 복붙)
```

## 배포 (EAS)

```bash
eas build -p android --profile internal   # 설치형 APK, 개발 서버 없이 실기기 시연 가능
eas update                                 # JS 번들 OTA 갱신
```

## 파일럿 범위

`../TeamUp/docs/rn-pilot-plan.md` 참고. 핵심 여정: 로그인/회원가입 → 모집 목록(필터) → 모집 상세 → 지원. 여유 시 마이페이지(지원한 모집)까지. 커뮤니티·랜딩·스토어 출시는 범위 밖.
