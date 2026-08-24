// TeamUp/src/features/recruit/schema.ts 복붙 — 클라이언트 즉시 검증용(서버는 웹 API가 재검증).
import { z } from "zod";
import { TECH_STACK_OPTIONS } from "@/config/tech-stack";

export const recruitRoleSchema = z.object({
  name: z.string().min(1, "역할명을 입력해주세요."),
  count: z.number().int().min(1, "1명 이상이어야 해요."),
});

export const createRecruitSchema = z.object({
  type: z.enum(["DEV", "PLAN"], { message: "유형을 선택해주세요." }),
  title: z
    .string()
    .min(5, "제목을 입력해주세요.")
    .max(60, "제목은 60자 이하로 입력해주세요."),
  content: z.string().min(10, "설명을 조금 더 작성해주세요."),
  techStack: z.array(z.string()).refine(
    (stacks) => stacks.every((s) => TECH_STACK_OPTIONS.includes(s)),
    { message: "기술 스택은 제공된 목록에서만 선택할 수 있어요." }
  ),
  roles: z.array(recruitRoleSchema).min(1, "최소 1개의 역할이 필요해요."),

  problem: z.string().optional(),
  targetUser: z.string().optional(),
  coreFeatures: z.string().optional(),
  reference: z.string().optional(),
});

export type CreateRecruitInput = z.infer<typeof createRecruitSchema>;

export const applyToRecruitSchema = z.object({
  message: z.string().max(1000, "지원 메시지는 1000자 이하로 입력해주세요.").optional(),
});

export type ApplyToRecruitInput = z.infer<typeof applyToRecruitSchema>;
