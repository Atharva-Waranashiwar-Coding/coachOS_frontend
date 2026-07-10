import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/athletes.api";
import { queryKeys } from "../../../api/query-keys";
import type { GoalCategory, GoalPayload, GoalStatus } from "../types";

export function useGoals(
  athleteId: string,
  filters: {
    page: number;
    page_size: number;
    status?: GoalStatus;
    category?: GoalCategory;
  },
) {
  return useQuery({
    queryKey: queryKeys.athletes.goals(athleteId, filters),
    queryFn: ({ signal }) => api.listGoals(athleteId, filters, signal),
    enabled: Boolean(athleteId),
    staleTime: 20_000,
  });
}
function invalidations(
  client: ReturnType<typeof useQueryClient>,
  athleteId: string,
) {
  return Promise.all([
    client.invalidateQueries({ queryKey: ["athletes", athleteId, "goals"] }),
    client.invalidateQueries({ queryKey: ["athletes", athleteId, "timeline"] }),
    client.invalidateQueries({ queryKey: queryKeys.dashboard }),
  ]);
}
export function useCreateGoal(athleteId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalPayload) => api.createGoal(athleteId, payload),
    onSuccess: () => invalidations(client, athleteId),
  });
}
export function useUpdateGoal(athleteId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: Partial<GoalPayload>;
    }) => api.updateGoal(athleteId, goalId, payload),
    onSuccess: () => invalidations(client, athleteId),
  });
}
export function useCancelGoal(athleteId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => api.cancelGoal(athleteId, goalId),
    onSuccess: () => invalidations(client, athleteId),
  });
}
