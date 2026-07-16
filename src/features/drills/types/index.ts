import type { PaginatedResponse } from "../../../types/api";

export const drillCategories = [
  "hitting",
  "pitching",
  "fielding",
  "throwing",
  "catching",
  "footwork",
  "speed",
  "strength",
  "mobility",
  "conditioning",
  "recovery",
  "mental",
  "general",
] as const;
export const drillDifficulties = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export const assignmentStatuses = [
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type DrillCategory = (typeof drillCategories)[number];
export type DrillDifficulty = (typeof drillDifficulties)[number];
export type DrillStatus = "active" | "archived";
export type AssignmentStatus = (typeof assignmentStatuses)[number];

export interface Drill {
  id: string;
  created_by_user_id: string;
  title: string;
  description: string | null;
  instructions: string;
  category: DrillCategory;
  sport: string;
  difficulty: DrillDifficulty;
  equipment: string[];
  estimated_duration_minutes: number | null;
  default_sets: number | null;
  default_repetitions: number | null;
  default_frequency: string | null;
  tags: string[];
  video_url: string | null;
  visibility: "private" | "organization" | "system";
  status: DrillStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface DrillPayload {
  title: string;
  description?: string | null;
  instructions: string;
  category: DrillCategory;
  difficulty: DrillDifficulty;
  equipment: string[];
  estimated_duration_minutes?: number | null;
  default_sets?: number | null;
  default_repetitions?: number | null;
  default_frequency?: string | null;
  tags: string[];
  video_url?: string | null;
}

export interface DrillListParams {
  search?: string;
  category?: DrillCategory;
  difficulty?: DrillDifficulty;
  status?: DrillStatus;
  tag?: string;
  page: number;
  page_size: number;
  sort_by?: "title" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

export interface AssignmentActivity {
  id: string;
  event_type:
    | "assigned"
    | "started"
    | "updated"
    | "progress_updated"
    | "completed"
    | "cancelled";
  notes: string | null;
  progress_value: number | null;
  occurred_at: string;
}

export interface DrillAssignment {
  id: string;
  athlete_id: string;
  drill_id: string | null;
  assigned_by_user_id: string;
  source_review_id: string | null;
  source_recommendation_index: number | null;
  title_snapshot: string;
  description_snapshot: string | null;
  instructions_snapshot: string;
  coach_notes: string | null;
  priority: number;
  status: AssignmentStatus;
  assigned_at: string;
  start_date: string | null;
  due_date: string | null;
  target_sets: number | null;
  target_repetitions: number | null;
  target_duration_minutes: number | null;
  frequency: string | null;
  completion_percentage: number;
  actual_sets: number | null;
  actual_repetitions: number | null;
  actual_duration_minutes: number | null;
  completed_at: string | null;
  cancelled_at: string | null;
  activities: AssignmentActivity[];
  created_at: string;
  updated_at: string;
}

export interface AssignmentOptions {
  priority?: number;
  start_date?: string | null;
  due_date?: string | null;
  target_sets?: number | null;
  target_repetitions?: number | null;
  target_duration_minutes?: number | null;
  frequency?: string | null;
  coach_notes?: string | null;
  instructions_override?: string | null;
}

export type AssignmentCreatePayload =
  | (AssignmentOptions & { mode: "library"; drill_id: string })
  | (AssignmentOptions & {
      mode: "review";
      source_review_id: string;
      source_recommendation_index: number;
      mapped_drill_id?: string | null;
      save_to_library: boolean;
    })
  | (AssignmentOptions & {
      mode: "custom";
      title: string;
      description?: string | null;
      instructions: string;
    });

export interface AssignmentListParams {
  status?: AssignmentStatus;
  category?: DrillCategory;
  priority?: number;
  due_before?: string;
  due_after?: string;
  source_review_id?: string;
  page: number;
  page_size: number;
  sort_by?: "assigned_at" | "due_date" | "priority" | "updated_at";
  sort_order?: "asc" | "desc";
}

export type DrillListResponse = PaginatedResponse<Drill>;
export type AssignmentListResponse = PaginatedResponse<DrillAssignment>;
