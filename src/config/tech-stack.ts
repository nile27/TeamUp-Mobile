// TeamUp/src/config/tech-stack.ts 복붙 (schema.ts가 참조).
export const TECH_STACK_CATEGORIES = [
  {
    label: "프론트엔드",
    items: ["React", "Next.js", "Vue.js", "TypeScript", "JavaScript", "Tailwind CSS"],
  },
  {
    label: "백엔드",
    items: ["Node.js", "Spring", "Django", "FastAPI", "Java", "Python"],
  },
  {
    label: "모바일",
    items: ["Flutter", "React Native", "Swift", "Kotlin"],
  },
  {
    label: "데이터/인프라",
    items: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "AWS", "Docker"],
  },
  {
    label: "디자인/기획",
    items: ["Figma", "UI/UX"],
  },
] as const;

export const TECH_STACK_OPTIONS: string[] = TECH_STACK_CATEGORIES.flatMap((c) => c.items);
