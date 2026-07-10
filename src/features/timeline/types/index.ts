import type { PaginatedResponse } from "../../../types/api";
export const eventCategories = [
  "profile",
  "goal",
  "practice",
  "video",
  "ai_review",
  "coach_review",
  "drill",
  "system",
] as const;
export type EventCategory = (typeof eventCategories)[number];
export type TimelineVisibility = "coach_only" | "athlete_visible";
export interface TimelineEvent {
  id: string;
  athlete_id: string;
  event_type: string;
  event_category: EventCategory;
  title: string;
  description: string | null;
  source_service: string;
  source_entity_type: string | null;
  source_entity_id: string | null;
  actor_user_id: string | null;
  metadata: Record<string, unknown>;
  schema_version: number;
  visibility: TimelineVisibility;
  occurred_at: string;
  created_at: string;
}
export interface TimelineParams {
  page: number;
  page_size: number;
  event_type?: string;
  event_category?: EventCategory;
  source_service?: string;
  start_date?: string;
  end_date?: string;
  visibility?: TimelineVisibility;
}
export type TimelineListResponse = PaginatedResponse<TimelineEvent>;
