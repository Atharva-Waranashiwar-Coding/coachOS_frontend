export type ReviewStatus =
  | "pending"
  | "processing"
  | "generated"
  | "failed"
  | "cancelled"
  | "approved"
  | "rejected";

export type ReviewType =
  | "general"
  | "hitting"
  | "pitching"
  | "fielding"
  | "throwing"
  | "footwork"
  | "mobility"
  | "strength"
  | "decision_making";

export interface Observation {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  confidence: number;
  evidence?: string | null;
}

export interface ReviewResult {
  summary: string;
  observations: Observation[];
  strengths: Array<{ title: string; description: string }>;
  improvement_areas: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  recommended_drills: Array<{
    name: string;
    description: string;
    reason: string;
    frequency?: string | null;
    difficulty: string;
    safety_note?: string | null;
  }>;
  limitations: string[];
}

export interface AIReview {
  id: string;
  athlete_id: string;
  practice_session_id: string;
  video_id: string;
  status: ReviewStatus;
  review_type: ReviewType;
  coach_context?: string | null;
  created_at: string;
  generation_started_at?: string | null;
  generation_completed_at?: string | null;
  failure_reason?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  result?: ReviewResult | null;
  latest_revision?:
    | (Omit<ReviewResult, "limitations"> & {
        coach_notes?: string | null;
      })
    | null;
}

export interface ReviewCreatePayload {
  athlete_id: string;
  practice_session_id: string;
  video_id: string;
  review_type: ReviewType;
  coach_context?: string;
  session_objectives: string[];
  requested_focus_areas: string[];
  manual_observations: string[];
  transcript?: string;
  frame_observations: Record<string, unknown>[];
}
