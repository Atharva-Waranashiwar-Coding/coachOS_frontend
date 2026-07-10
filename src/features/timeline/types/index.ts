import type { PaginatedResponse } from "../../../types/api";
export interface TimelineEvent {
  id: string;
  athlete_id: string;
  event_type: string;
  title: string;
  description: string | null;
  source_service: string;
  source_entity_type: string | null;
  source_entity_id: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_by_user_id: string | null;
  created_at: string;
}
export interface TimelineParams {
  page: number;
  page_size: number;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}
export type TimelineListResponse = PaginatedResponse<TimelineEvent>;
