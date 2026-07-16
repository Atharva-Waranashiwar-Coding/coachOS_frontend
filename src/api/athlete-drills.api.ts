import { athleteClient } from "./api-client";
import type {
  AthleteAssignment,
  Page,
} from "../features/athlete-dashboard/types";

export interface AthleteProgressPayload {
  completion_percentage: number;
  actual_sets?: number;
  actual_repetitions?: number;
  actual_duration_minutes?: number;
  athlete_note?: string;
}

export interface AthleteCompletionPayload {
  confirmation: true;
  actual_sets?: number;
  actual_repetitions?: number;
  actual_duration_minutes?: number;
  athlete_note?: string;
}

export async function getAthleteAssignments(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<Page<AthleteAssignment>> {
  const { data } = await athleteClient.get<Page<AthleteAssignment>>(
    "/api/v1/athlete/drill-assignments",
    { params, signal },
  );
  return data;
}

export async function getAthleteAssignment(
  assignmentId: string,
  signal?: AbortSignal,
): Promise<AthleteAssignment> {
  const { data } = await athleteClient.get<AthleteAssignment>(
    `/api/v1/athlete/drill-assignments/${assignmentId}`,
    { signal },
  );
  return data;
}

export async function startAthleteAssignment(
  assignmentId: string,
): Promise<AthleteAssignment> {
  const { data } = await athleteClient.post<AthleteAssignment>(
    `/api/v1/athlete/drill-assignments/${assignmentId}/start`,
  );
  return data;
}

export async function updateAthleteAssignmentProgress(
  assignmentId: string,
  payload: AthleteProgressPayload,
): Promise<AthleteAssignment> {
  const { data } = await athleteClient.post<AthleteAssignment>(
    `/api/v1/athlete/drill-assignments/${assignmentId}/progress`,
    payload,
  );
  return data;
}

export async function completeAthleteAssignment(
  assignmentId: string,
  payload: AthleteCompletionPayload,
): Promise<AthleteAssignment> {
  const { data } = await athleteClient.post<AthleteAssignment>(
    `/api/v1/athlete/drill-assignments/${assignmentId}/complete`,
    payload,
  );
  return data;
}
