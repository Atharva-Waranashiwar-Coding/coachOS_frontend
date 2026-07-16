import type { Page } from "../athlete-dashboard/types";

export interface AthleteFeedbackSummary {
  review_id: string;
  review_type: string;
  athlete_message: string | null;
  summary_excerpt: string;
  approved_at: string;
  session_context: {
    title: string | null;
    session_type: string | null;
    session_date: string | null;
    location: string | null;
  } | null;
}

export interface AthleteFeedbackDetail {
  review_id: string;
  review_type: string;
  summary: string;
  observations: Array<{
    title: string;
    description: string;
    category: string;
    priority: string;
    coach_verified: boolean;
  }>;
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
    frequency: string | null;
    difficulty: string;
    safety_note: string | null;
  }>;
  athlete_message: string | null;
  approved_at: string;
  session_context: AthleteFeedbackSummary["session_context"];
}

export type AthleteFeedbackPage = Page<AthleteFeedbackSummary>;
