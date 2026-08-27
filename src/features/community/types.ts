export type CommunityTag = "IDEA" | "QUESTION" | "ETC";

export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  tag: CommunityTag;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: { nickname: string };
  _count: { comments: number; likes: number };
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { nickname: string };
};

export type CommunityPostDetail = Omit<CommunityPost, "author"> & {
  // 상세 조회만 author.id를 내려줌(목록은 nickname만) — 삭제 버튼 노출 여부 판단용.
  author: { id: string; nickname: string };
  comments: Comment[];
  // 로그인 상태로 상세 조회했을 때만 실제 값(비로그인 응답은 항상 false).
  alreadyLiked: boolean;
};

export type CommunityListResponse = {
  posts: CommunityPost[];
  page: number;
  totalPages: number;
};
