import { apiGet } from "@/lib/api-client";
import type { Application } from "@/features/recruit/types";

export type DashboardData = {
  profile: { id: string; nickname: string; email: string } | null;
  myRecruits: { id: string; title: string }[];
  myPosts: { id: string; title: string }[];
  myApplications: (Application & { recruit: { id: string; title: string; type: string } })[];
};

export function fetchDashboard() {
  return apiGet<DashboardData>("/api/dashboard");
}
