import { router } from "expo-router";
import { NotFoundState } from "@/components/not-found-state";

// Expo Router가 매칭되는 라우트를 못 찾으면 자동으로 이 파일을 렌더링함
// (파일명 +not-found.tsx는 규칙). 기본 제공되는 안내 화면 대신 브랜드에 맞춘
// 404 화면으로 대체.
export default function NotFoundScreen() {
  return (
    <NotFoundState
      title="페이지를 찾을 수 없어요"
      description="주소가 잘못됐거나, 삭제된 화면일 수 있어요."
      actionLabel="모집 목록으로 돌아가기"
      onAction={() => router.replace("/(app)/recruit")}
    />
  );
}
