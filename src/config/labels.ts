// TeamUp/src/config/labels.ts 일부 복붙.
export const RECRUIT_TYPE_LABEL: Record<"DEV" | "PLAN", string> = {
  DEV: "개발자 구해요",
  PLAN: "기획자 구해요",
};

export const COMMUNITY_TAG_LABEL: Record<"IDEA" | "QUESTION" | "ETC", string> = {
  IDEA: "아이디어",
  QUESTION: "질문",
  ETC: "기타",
};

export const COMMUNITY_TAG_FILTERS: { value: "IDEA" | "QUESTION" | "ETC" | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "IDEA", label: "아이디어" },
  { value: "QUESTION", label: "질문" },
  { value: "ETC", label: "기타" },
];
