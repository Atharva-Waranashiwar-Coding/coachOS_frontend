import type { PaginatedResponse } from "../../../types/api";
export const goalCategories = [
  "hitting",
  "pitching",
  "fielding",
  "strength",
  "speed",
  "mobility",
  "mental",
  "recruiting",
  "general",
] as const;
export const goalStatuses = [
  "active",
  "completed",
  "paused",
  "cancelled",
] as const;
export type GoalCategory = (typeof goalCategories)[number];
export type GoalStatus = (typeof goalStatuses)[number];
export interface Goal {
  id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_date: string | null;
  status: GoalStatus;
  priority: number;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
export interface GoalPayload {
  title: string;
  description?: string | null;
  category: GoalCategory;
  target_date?: string | null;
  priority: number;
  status?: GoalStatus;
}
export type GoalListResponse = PaginatedResponse<Goal>;
