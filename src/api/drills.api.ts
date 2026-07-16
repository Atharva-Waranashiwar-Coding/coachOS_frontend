import { athleteClient } from "./api-client";
import type {
  AssignmentCreatePayload,
  AssignmentListParams,
  AssignmentListResponse,
  Drill,
  DrillAssignment,
  DrillListParams,
  DrillListResponse,
  DrillPayload,
} from "../features/drills/types";

export async function listDrills(
  params: DrillListParams,
  signal?: AbortSignal,
): Promise<DrillListResponse> {
  const { data } = await athleteClient.get<DrillListResponse>(
    "/api/v1/drills",
    { params, signal },
  );
  return data;
}

export async function getDrill(
  id: string,
  signal?: AbortSignal,
): Promise<Drill> {
  const { data } = await athleteClient.get<Drill>(`/api/v1/drills/${id}`, {
    signal,
  });
  return data;
}

export async function createDrill(payload: DrillPayload): Promise<Drill> {
  const { data } = await athleteClient.post<Drill>("/api/v1/drills", payload);
  return data;
}

export async function updateDrill(
  id: string,
  payload: Partial<DrillPayload>,
): Promise<Drill> {
  const { data } = await athleteClient.patch<Drill>(
    `/api/v1/drills/${id}`,
    payload,
  );
  return data;
}

export async function archiveDrill(id: string): Promise<void> {
  await athleteClient.delete(`/api/v1/drills/${id}`);
}

export async function restoreDrill(id: string): Promise<Drill> {
  const { data } = await athleteClient.post<Drill>(
    `/api/v1/drills/${id}/restore`,
  );
  return data;
}

export async function listAssignments(
  athleteId: string,
  params: AssignmentListParams,
  signal?: AbortSignal,
): Promise<AssignmentListResponse> {
  const { data } = await athleteClient.get<AssignmentListResponse>(
    `/api/v1/athletes/${athleteId}/drill-assignments`,
    { params, signal },
  );
  return data;
}

export async function getAssignment(
  athleteId: string,
  assignmentId: string,
  signal?: AbortSignal,
): Promise<DrillAssignment> {
  const { data } = await athleteClient.get<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments/${assignmentId}`,
    { signal },
  );
  return data;
}

export async function createAssignment(
  athleteId: string,
  payload: AssignmentCreatePayload,
): Promise<DrillAssignment> {
  const { data } = await athleteClient.post<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments`,
    payload,
  );
  return data;
}

export async function updateAssignment(
  athleteId: string,
  assignmentId: string,
  payload: Partial<DrillAssignment>,
): Promise<DrillAssignment> {
  const { data } = await athleteClient.patch<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments/${assignmentId}`,
    payload,
  );
  return data;
}

export async function startAssignment(
  athleteId: string,
  assignmentId: string,
): Promise<DrillAssignment> {
  const { data } = await athleteClient.post<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments/${assignmentId}/start`,
  );
  return data;
}

export async function completeAssignment(
  athleteId: string,
  assignmentId: string,
  payload: {
    completion_notes?: string | null;
    actual_sets?: number | null;
    actual_repetitions?: number | null;
    actual_duration_minutes?: number | null;
  },
): Promise<DrillAssignment> {
  const { data } = await athleteClient.post<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments/${assignmentId}/complete`,
    payload,
  );
  return data;
}

export async function cancelAssignment(
  athleteId: string,
  assignmentId: string,
  reason?: string | null,
): Promise<DrillAssignment> {
  const { data } = await athleteClient.post<DrillAssignment>(
    `/api/v1/athletes/${athleteId}/drill-assignments/${assignmentId}/cancel`,
    { reason: reason || null },
  );
  return data;
}
