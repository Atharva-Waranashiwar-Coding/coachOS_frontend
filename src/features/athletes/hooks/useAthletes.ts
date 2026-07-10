import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/athletes.api";
import { queryKeys } from "../../../api/query-keys";
import type { AthleteListParams, AthletePayload } from "../types";

export function useAthletes(params: AthleteListParams) {
  return useQuery({
    queryKey: queryKeys.athletes.list(params),
    queryFn: ({ signal }) => api.listAthletes(params, signal),
    staleTime: 30_000,
  });
}
export function useAthlete(id: string) {
  return useQuery({
    queryKey: queryKeys.athletes.detail(id),
    queryFn: ({ signal }) => api.getAthlete(id, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
export function useCreateAthlete() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.createAthlete,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.athletes.lists() }),
  });
}
export function useUpdateAthlete(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AthletePayload>) =>
      api.updateAthlete(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.athletes.detail(id) }),
        client.invalidateQueries({ queryKey: queryKeys.athletes.lists() }),
        client.invalidateQueries({ queryKey: ["athletes", id, "timeline"] }),
      ]),
  });
}
export function useArchiveAthlete(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.archiveAthlete(id),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.athletes.detail(id) }),
        client.invalidateQueries({ queryKey: queryKeys.athletes.lists() }),
        client.invalidateQueries({ queryKey: ["athletes", id, "timeline"] }),
      ]),
  });
}
export function useRestoreAthlete(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.restoreAthlete(id),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.athletes.detail(id) }),
        client.invalidateQueries({ queryKey: queryKeys.athletes.lists() }),
        client.invalidateQueries({ queryKey: ["athletes", id, "timeline"] }),
      ]),
  });
}
