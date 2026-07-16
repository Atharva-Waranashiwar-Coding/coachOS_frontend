import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/reviews.api";
import type {
  ApprovalPayload,
  RejectionPayload,
  ReviewCreatePayload,
  ReviewStatus,
  RevisionPayload,
} from "../types";

const root = ["reviews"] as const;
const detail = (id: string) => [...root, id] as const;

export function useReviews(filters?: {
  athlete_id?: string;
  video_id?: string;
  status?: ReviewStatus;
}) {
  return useQuery({
    queryKey: [...root, "list", filters],
    queryFn: () => api.listReviews(filters),
    refetchInterval: 10_000,
  });
}
export function useReview(id: string) {
  return useQuery({
    queryKey: detail(id),
    queryFn: ({ signal }) => api.getReview(id, signal),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}
export function useRevisions(id: string) {
  return useQuery({
    queryKey: [...detail(id), "revisions"],
    queryFn: () => api.listRevisions(id),
    enabled: Boolean(id),
  });
}
export function useRevision(id: string, revisionId: string) {
  return useQuery({
    queryKey: [...detail(id), "revisions", revisionId],
    queryFn: () => api.getRevision(id, revisionId),
    enabled: Boolean(id && revisionId),
  });
}
export function useApprovedSnapshot(id: string) {
  return useQuery({
    queryKey: [...detail(id), "approved"],
    queryFn: () => api.getApprovedSnapshot(id),
    enabled: Boolean(id),
  });
}
export function useAuditLog(id: string) {
  return useQuery({
    queryKey: [...detail(id), "audit"],
    queryFn: () => api.getAuditLog(id),
    enabled: Boolean(id),
  });
}

export function useCreateReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewCreatePayload) => api.createReview(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: root }),
  });
}
export function useCreateRevision(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: RevisionPayload) => api.createRevision(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: detail(id) }),
        client.invalidateQueries({ queryKey: [...detail(id), "revisions"] }),
        client.invalidateQueries({ queryKey: [...detail(id), "audit"] }),
        client.invalidateQueries({ queryKey: ["insights"] }),
      ]),
  });
}
export function usePreviewReview(id: string) {
  return useMutation({
    mutationFn: (payload: {
      revision_id?: string | null;
      visibility: "coach_only" | "athlete_visible";
      athlete_message?: string | null;
    }) => api.previewReview(id, payload),
  });
}
export function useApproveReview(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApprovalPayload) => api.approveReview(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: root }),
        client.invalidateQueries({ queryKey: detail(id) }),
        client.invalidateQueries({ queryKey: [...detail(id), "approved"] }),
        client.invalidateQueries({ queryKey: [...detail(id), "audit"] }),
        client.invalidateQueries({ queryKey: ["insights"] }),
      ]),
  });
}
export function useRejectReview(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: RejectionPayload) => api.rejectReview(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: root }),
        client.invalidateQueries({ queryKey: detail(id) }),
        client.invalidateQueries({ queryKey: [...detail(id), "audit"] }),
      ]),
  });
}
