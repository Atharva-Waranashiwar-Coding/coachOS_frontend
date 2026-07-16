import { aiReviewClient } from "./api-client";
import type {
  AthleteFeedbackDetail,
  AthleteFeedbackPage,
} from "../features/athlete-feedback/types";

export async function getAthleteFeedback(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<AthleteFeedbackPage> {
  const { data } = await aiReviewClient.get<AthleteFeedbackPage>(
    "/api/v1/athlete/reviews",
    {
      params,
      signal,
    },
  );
  return data;
}

export async function getAthleteFeedbackDetail(
  reviewId: string,
  signal?: AbortSignal,
): Promise<AthleteFeedbackDetail> {
  const { data } = await aiReviewClient.get<AthleteFeedbackDetail>(
    `/api/v1/athlete/reviews/${reviewId}`,
    { signal },
  );
  return data;
}
