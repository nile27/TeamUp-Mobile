export type RecruitRole = {
  id: string;
  name: string;
  count: number;
};

export type Recruit = {
  id: string;
  type: "DEV" | "PLAN";
  title: string;
  content: string;
  techStack: string[];
  problem: string | null;
  targetUser: string | null;
  coreFeatures: string | null;
  reference: string | null;
  completeness: number;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  roles: RecruitRole[];
  author?: { id: string; nickname: string; avatarUrl: string | null };
  _count: { applications: number; bookmarks: number };
  // 로그인 상태로 상세 조회했을 때만 실제 값(비로그인/목록 응답은 항상 false).
  alreadyApplied: boolean;
};

export type RecruitListResponse = {
  recruits: Recruit[];
  // null이면 더 불러올 게 없음.
  nextCursor: string | null;
};

export type Application = {
  id: string;
  recruitId: string;
  applicantId: string;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};
