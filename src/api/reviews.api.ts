import { aiReviewClient } from "./api-client";
import type {
  AIReview,
  ApprovalPayload,
  ApprovedSnapshot,
  AthletePreview,
  AuditPage,
  RejectionPayload,
  ReviewCreatePayload,
  ReviewStatus,
  Revision,
  RevisionPage,
  RevisionPayload,
} from "../features/ai-review/types";

export async function listReviews(params?: {
  athlete_id?: string;
  video_id?: string;
  status?: ReviewStatus;
}): Promise<AIReview[]> {
  const { data } = await aiReviewClient.get<AIReview[]>("/api/v1/reviews", {
    params,
  });
  return data;
}
export async function getReview(
  id: string,
  signal?: AbortSignal,
): Promise<AIReview> {
  const { data } = await aiReviewClient.get<AIReview>(`/api/v1/reviews/${id}`, {
    signal,
  });
  return data;
}
export async function createReview(
  payload: ReviewCreatePayload,
): Promise<{ review_id: string }> {
  const { data } = await aiReviewClient.post<{ review_id: string }>(
    "/api/v1/reviews",
    payload,
    { headers: { "Idempotency-Key": crypto.randomUUID() } },
  );
  return data;
}
export async function createRevision(
  id: string,
  payload: RevisionPayload,
): Promise<Revision> {
  const { data } = await aiReviewClient.post<Revision>(
    `/api/v1/reviews/${id}/revisions`,
    payload,
  );
  return data;
}
export async function previewReview(
  id: string,
  payload: {
    revision_id?: string | null;
    visibility: "coach_only" | "athlete_visible";
    athlete_message?: string | null;
  },
): Promise<AthletePreview> {
  const { data } = await aiReviewClient.post<AthletePreview>(
    `/api/v1/reviews/${id}/preview`,
    payload,
  );
  return data;
}
export async function approveReview(
  id: string,
  payload: ApprovalPayload,
): Promise<ApprovedSnapshot> {
  const { data } = await aiReviewClient.post<ApprovedSnapshot>(
    `/api/v1/reviews/${id}/approve`,
    payload,
  );
  return data;
}
export async function rejectReview(
  id: string,
  payload: RejectionPayload,
): Promise<AIReview> {
  const { data } = await aiReviewClient.post<AIReview>(
    `/api/v1/reviews/${id}/reject`,
    payload,
  );
  return data;
}
export async function listRevisions(id: string): Promise<RevisionPage> {
  const { data } = await aiReviewClient.get<RevisionPage>(
    `/api/v1/reviews/${id}/revisions`,
  );
  return data;
}
export async function getRevision(
  id: string,
  revisionId: string,
): Promise<Revision> {
  const { data } = await aiReviewClient.get<Revision>(
    `/api/v1/reviews/${id}/revisions/${revisionId}`,
  );
  return data;
}
export async function getApprovedSnapshot(
  id: string,
): Promise<ApprovedSnapshot> {
  const { data } = await aiReviewClient.get<ApprovedSnapshot>(
    `/api/v1/reviews/${id}/approved`,
  );
  return data;
}
export async function getAuditLog(id: string): Promise<AuditPage> {
  const { data } = await aiReviewClient.get<AuditPage>(
    `/api/v1/reviews/${id}/audit-log`,
  );
  return data;
}
