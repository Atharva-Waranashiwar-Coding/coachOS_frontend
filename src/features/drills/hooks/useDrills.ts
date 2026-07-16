import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/drills.api";
import { queryKeys } from "../../../api/query-keys";
import type {
  AssignmentCreatePayload,
  AssignmentListParams,
  DrillListParams,
  DrillPayload,
} from "../types";

export function useDrills(filters: DrillListParams) {
  return useQuery({
    queryKey: queryKeys.drills.list(filters),
    queryFn: ({ signal }) => api.listDrills(filters, signal),
    staleTime: 20_000,
  });
}

export function useDrill(id: string) {
  return useQuery({
    queryKey: queryKeys.drills.detail(id),
    queryFn: ({ signal }) => api.getDrill(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateDrill() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.createDrill,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.drills.all }),
  });
}

export function useUpdateDrill(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DrillPayload>) =>
      api.updateDrill(id, payload),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.drills.all }),
        client.invalidateQueries({ queryKey: queryKeys.drills.detail(id) }),
      ]),
  });
}

export function useArchiveDrill() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.archiveDrill,
    onSuccess: (_, id) =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.drills.all }),
        client.invalidateQueries({ queryKey: queryKeys.drills.detail(id) }),
      ]),
  });
}

export function useRestoreDrill() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.restoreDrill,
    onSuccess: (drill) =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.drills.all }),
        client.invalidateQueries({
          queryKey: queryKeys.drills.detail(drill.id),
        }),
      ]),
  });
}

export function useAssignments(
  athleteId: string,
  filters: AssignmentListParams,
) {
  return useQuery({
    queryKey: queryKeys.athletes.drills(athleteId, filters),
    queryFn: ({ signal }) => api.listAssignments(athleteId, filters, signal),
    enabled: Boolean(athleteId),
    staleTime: 15_000,
  });
}

export function useAssignment(athleteId: string, assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.athletes.drill(athleteId, assignmentId),
    queryFn: ({ signal }) => api.getAssignment(athleteId, assignmentId, signal),
    enabled: Boolean(athleteId && assignmentId),
  });
}

function invalidateAssignmentData(
  client: ReturnType<typeof useQueryClient>,
  athleteId: string,
  assignmentId?: string,
) {
  return Promise.all([
    client.invalidateQueries({
      queryKey: ["athletes", athleteId, "drill-assignments"],
    }),
    assignmentId
      ? client.invalidateQueries({
          queryKey: queryKeys.athletes.drill(athleteId, assignmentId),
        })
      : Promise.resolve(),
    client.invalidateQueries({
      queryKey: ["athletes", athleteId, "timeline"],
    }),
    client.invalidateQueries({ queryKey: queryKeys.dashboard }),
  ]);
}

export function useCreateAssignment(athleteId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignmentCreatePayload) =>
      api.createAssignment(athleteId, payload),
    onSuccess: (assignment, payload) =>
      Promise.all([
        invalidateAssignmentData(client, athleteId, assignment.id),
        payload.mode === "review" && payload.save_to_library
          ? client.invalidateQueries({ queryKey: queryKeys.drills.all })
          : Promise.resolve(),
      ]),
  });
}

export function useUpdateAssignment(athleteId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateAssignment>[2]) =>
      api.updateAssignment(athleteId, assignmentId, payload),
    onSuccess: () => invalidateAssignmentData(client, athleteId, assignmentId),
  });
}

export function useStartAssignment(athleteId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.startAssignment(athleteId, assignmentId),
    onSuccess: () => invalidateAssignmentData(client, athleteId, assignmentId),
  });
}

export function useCompleteAssignment(athleteId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.completeAssignment>[2]) =>
      api.completeAssignment(athleteId, assignmentId, payload),
    onSuccess: () => invalidateAssignmentData(client, athleteId, assignmentId),
  });
}

export function useCancelAssignment(athleteId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string | null) =>
      api.cancelAssignment(athleteId, assignmentId, reason),
    onSuccess: () => invalidateAssignmentData(client, athleteId, assignmentId),
  });
}
