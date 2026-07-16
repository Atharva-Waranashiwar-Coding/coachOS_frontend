export type ReviewStatus =
  | "pending"
  | "processing"
  | "generated"
  | "failed"
  | "cancelled"
  | "approved"
  | "rejected";
export type ReviewVisibility = "coach_only" | "athlete_visible";
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
export type RejectionCategory =
  | "inaccurate"
  | "insufficient"
  | "unsafe"
  | "irrelevant"
  | "too_generic"
  | "inadequate_context"
  | "other";

export interface Observation {
  title: string;
  description: string;
  category:
    | "technique"
    | "consistency"
    | "effort"
    | "decision_making"
    | "mobility"
    | "strength"
    | "safety"
    | "other";
  priority: "low" | "medium" | "high";
  confidence?: number | null;
  evidence?: string | null;
  coach_verified: boolean;
}
export interface Strength {
  title: string;
  description: string;
}
export interface ImprovementArea {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}
export interface RecommendedDrill {
  name: string;
  description: string;
  reason: string;
  frequency?: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  safety_note?: string | null;
}
export interface ReviewContent {
  summary: string;
  observations: Observation[];
  strengths: Strength[];
  improvement_areas: ImprovementArea[];
  recommended_drills: RecommendedDrill[];
}
export interface ActiveDraft extends ReviewContent {
  source: "generated" | "revision";
  revision_id?: string | null;
  revision_number: number;
  coach_notes?: string | null;
  athlete_message?: string | null;
  change_summary?: string | null;
}
export interface ReviewResult extends Omit<ReviewContent, "observations"> {
  observations: Array<
    Omit<Observation, "coach_verified"> & { coach_verified?: boolean }
  >;
  limitations: string[];
}
export interface ApprovedSnapshot extends ReviewContent {
  id: string;
  source_revision_id?: string | null;
  approved_by_user_id: string;
  athlete_message?: string | null;
  visibility: ReviewVisibility;
  approved_at: string;
}
export interface AllowedActions {
  can_edit: boolean;
  can_preview: boolean;
  can_approve: boolean;
  can_reject: boolean;
  can_retry: boolean;
}
export interface AIReview {
  id: string;
  athlete_id: string;
  practice_session_id: string;
  video_id: string;
  status: ReviewStatus;
  review_type: ReviewType;
  latest_revision_number: number;
  generated_at?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  result?: ReviewResult | null;
  active_draft?: ActiveDraft | null;
  approved_snapshot?: ApprovedSnapshot | null;
  rejection_category?: RejectionCategory | null;
  allowed_actions: AllowedActions;
}
export interface Revision extends ActiveDraft {
  id: string;
  edited_by_user_id: string;
  based_on_revision_number?: number | null;
  created_at: string;
  source: "revision";
}
export interface RevisionPage {
  items: Array<
    Pick<
      Revision,
      | "id"
      | "revision_number"
      | "edited_by_user_id"
      | "change_summary"
      | "based_on_revision_number"
      | "created_at"
    >
  >;
  page: number;
  page_size: number;
  total: number;
}
export interface AthletePreview extends ReviewContent {
  athlete_id: string;
  review_id: string;
  athlete_message?: string | null;
  visibility: ReviewVisibility;
  is_preview: true;
}
export interface AuditEvent {
  id: string;
  actor_user_id?: string | null;
  action_type: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}
export interface AuditPage {
  items: AuditEvent[];
  page: number;
  page_size: number;
  total: number;
}
export interface RevisionPayload extends ReviewContent {
  expected_revision_number: number;
  coach_notes?: string | null;
  athlete_message?: string | null;
  change_summary?: string | null;
}
export interface ApprovalPayload {
  revision_id?: string | null;
  expected_revision_number: number;
  visibility: ReviewVisibility;
  athlete_message?: string | null;
  confirmation: boolean;
}
export interface RejectionPayload {
  category: RejectionCategory;
  reason?: string | null;
  expected_revision_number: number;
  confirmation: boolean;
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
