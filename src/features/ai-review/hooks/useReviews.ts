import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/reviews.api";
import type { AIReview, ReviewCreatePayload, ReviewStatus } from "../types";

const key = (id?: string) => ["reviews", id] as const;

export function useReviews(filters?: {
  athlete_id?: string;
  video_id?: string;
  status?: ReviewStatus;
}) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => api.listReviews(filters),
    refetchInterval: 10_000,
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: key(id),
    queryFn: ({ signal }) => api.getReview(id, signal),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}

export function useCreateReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewCreatePayload) => api.createReview(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useReviewTransition(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (action: "approve" | "reject" | "retry" | "cancel") =>
      api.transitionReview(id, action),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["reviews"] }),
        client.invalidateQueries({ queryKey: key(id) }),
      ]),
  });
}

export function useSaveReviewDraft(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: NonNullable<AIReview["latest_revision"]>) =>
      api.updateReviewDraft(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["reviews"] }),
        client.invalidateQueries({ queryKey: key(id) }),
      ]),
  });
}
