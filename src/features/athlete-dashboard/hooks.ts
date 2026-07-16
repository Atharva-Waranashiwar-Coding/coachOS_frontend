import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as dashboardApi from "../../api/athlete-dashboard.api";
import * as drillsApi from "../../api/athlete-drills.api";
import * as feedbackApi from "../../api/athlete-feedback.api";
import * as goalsApi from "../../api/athlete-goals.api";
import * as profileApi from "../../api/athlete-profile.api";
import { queryKeys } from "../../api/query-keys";
import * as timelineApi from "../../api/athlete-timeline.api";

export function useAthleteMe() {
  return useQuery({
    queryKey: queryKeys.athlete.me,
    queryFn: ({ signal }) => profileApi.getAthleteMe(signal),
    staleTime: 60_000,
  });
}

export function useAthleteDashboard() {
  return useQuery({
    queryKey: queryKeys.athlete.dashboard,
    queryFn: ({ signal }) => dashboardApi.getAthleteDashboard(signal),
  });
}

export function useAthleteFeedback(
  filters: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: queryKeys.athlete.feedbackList(filters),
    queryFn: ({ signal }) => feedbackApi.getAthleteFeedback(filters, signal),
  });
}

export function useAthleteFeedbackDetail(reviewId: string) {
  return useQuery({
    queryKey: queryKeys.athlete.feedbackDetail(reviewId),
    queryFn: ({ signal }) =>
      feedbackApi.getAthleteFeedbackDetail(reviewId, signal),
    enabled: Boolean(reviewId),
  });
}

export function useAthleteAssignments(
  filters: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: queryKeys.athlete.assignments(filters),
    queryFn: ({ signal }) => drillsApi.getAthleteAssignments(filters, signal),
  });
}

export function useAthleteAssignment(assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.athlete.assignment(assignmentId),
    queryFn: ({ signal }) =>
      drillsApi.getAthleteAssignment(assignmentId, signal),
    enabled: Boolean(assignmentId),
  });
}

function invalidateAssignment(
  client: ReturnType<typeof useQueryClient>,
  assignmentId: string,
  includeTimeline: boolean,
) {
  const invalidations = [
    client.invalidateQueries({
      queryKey: queryKeys.athlete.assignment(assignmentId),
    }),
    client.invalidateQueries({ queryKey: ["athlete", "assignments"] }),
    client.invalidateQueries({ queryKey: queryKeys.athlete.dashboard }),
  ];
  if (includeTimeline)
    invalidations.push(
      client.invalidateQueries({ queryKey: ["athlete", "timeline"] }),
    );
  return Promise.all(invalidations);
}

export function useStartAthleteAssignment(assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => drillsApi.startAthleteAssignment(assignmentId),
    onSuccess: () => invalidateAssignment(client, assignmentId, true),
  });
}

export function useUpdateAthleteProgress(assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: drillsApi.AthleteProgressPayload) =>
      drillsApi.updateAthleteAssignmentProgress(assignmentId, payload),
    onSuccess: () => invalidateAssignment(client, assignmentId, false),
  });
}

export function useCompleteAthleteAssignment(assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: drillsApi.AthleteCompletionPayload) =>
      drillsApi.completeAthleteAssignment(assignmentId, payload),
    onSuccess: () => invalidateAssignment(client, assignmentId, true),
  });
}

export function useAthleteTimeline(
  filters: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: queryKeys.athlete.timeline(filters),
    queryFn: ({ signal }) => timelineApi.getAthleteTimeline(filters, signal),
  });
}

export function useAthleteGoals(
  filters: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: queryKeys.athlete.goals(filters),
    queryFn: ({ signal }) => goalsApi.getAthleteGoals(filters, signal),
  });
}
