import { aiReviewClient } from "./api-client";
import type {
  AIReview,
  ReviewCreatePayload,
  ReviewStatus,
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
    {
      headers: { "Idempotency-Key": crypto.randomUUID() },
    },
  );
  return data;
}

export async function transitionReview(
  id: string,
  action: "approve" | "reject" | "retry" | "cancel",
): Promise<AIReview> {
  const { data } = await aiReviewClient.post<AIReview>(
    `/api/v1/reviews/${id}/${action}`,
  );
  return data;
}

export async function updateReviewDraft(
  id: string,
  payload: NonNullable<AIReview["latest_revision"]>,
): Promise<AIReview> {
  const { data } = await aiReviewClient.patch<AIReview>(
    `/api/v1/reviews/${id}/draft`,
    payload,
  );
  return data;
}
