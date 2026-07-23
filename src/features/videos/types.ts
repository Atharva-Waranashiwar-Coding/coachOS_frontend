import type { PaginatedResponse } from "../../types/api";

export type SessionType =
  | "practice"
  | "game"
  | "bullpen"
  | "batting"
  | "fielding"
  | "strength"
  | "assessment"
  | "other";
export type SessionStatus = "draft" | "active" | "completed" | "cancelled";
export interface PracticeSession {
  id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  session_date: string;
  location: string | null;
  session_type: SessionType;
  status: SessionStatus;
}
export interface VideoSummary {
  id: string;
  practice_session_id: string;
  athlete_id: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  upload_status: string;
  processing_status: string;
  created_at: string;
  uploaded_at: string | null;
}
export type SessionList = PaginatedResponse<PracticeSession>;
export type VideoList = PaginatedResponse<VideoSummary>;
export interface UploadTicket {
  video_id: string;
  upload_url: string;
  required_headers: Record<string, string>;
}
