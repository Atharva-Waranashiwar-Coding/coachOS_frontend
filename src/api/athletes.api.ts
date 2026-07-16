import { athleteClient } from "./api-client";
import type {
  AthleteDetail,
  AthleteListParams,
  AthleteListResponse,
  AthletePayload,
} from "../features/athletes/types";
import type {
  Goal,
  GoalListResponse,
  GoalPayload,
  GoalStatus,
  GoalCategory,
} from "../features/goals/types";
import type {
  TimelineListResponse,
  TimelineParams,
} from "../features/timeline/types";

export interface AthleteInvitation {
  athlete_id: string;
  auth_user_id: string;
  email: string;
  status: "invited" | "active" | "disabled";
  invited_at: string;
  activated_at: string | null;
  disabled_at: string | null;
  development_invitation_url: string | null;
}

export async function listAthletes(
  params: AthleteListParams,
  signal?: AbortSignal,
): Promise<AthleteListResponse> {
  const { data } = await athleteClient.get<AthleteListResponse>(
    "/api/v1/athletes",
    { params, signal },
  );
  return data;
}
export async function getAthlete(
  id: string,
  signal?: AbortSignal,
): Promise<AthleteDetail> {
  const { data } = await athleteClient.get<AthleteDetail>(
    `/api/v1/athletes/${id}`,
    { signal },
  );
  return data;
}
export async function createAthlete(
  payload: AthletePayload,
): Promise<AthleteDetail> {
  const { data } = await athleteClient.post<AthleteDetail>(
    "/api/v1/athletes",
    payload,
  );
  return data;
}
export async function updateAthlete(
  id: string,
  payload: Partial<AthletePayload>,
): Promise<AthleteDetail> {
  const { data } = await athleteClient.patch<AthleteDetail>(
    `/api/v1/athletes/${id}`,
    payload,
  );
  return data;
}
export async function archiveAthlete(id: string): Promise<void> {
  await athleteClient.delete(`/api/v1/athletes/${id}`);
}
export async function restoreAthlete(id: string): Promise<AthleteDetail> {
  const { data } = await athleteClient.post<AthleteDetail>(
    `/api/v1/athletes/${id}/restore`,
  );
  return data;
}

export async function listGoals(
  id: string,
  params: {
    page: number;
    page_size: number;
    status?: GoalStatus;
    category?: GoalCategory;
  },
  signal?: AbortSignal,
): Promise<GoalListResponse> {
  const { data } = await athleteClient.get<GoalListResponse>(
    `/api/v1/athletes/${id}/goals`,
    { params, signal },
  );
  return data;
}
export async function createGoal(
  id: string,
  payload: GoalPayload,
): Promise<Goal> {
  const { data } = await athleteClient.post<Goal>(
    `/api/v1/athletes/${id}/goals`,
    payload,
  );
  return data;
}
export async function updateGoal(
  id: string,
  goalId: string,
  payload: Partial<GoalPayload>,
): Promise<Goal> {
  const { data } = await athleteClient.patch<Goal>(
    `/api/v1/athletes/${id}/goals/${goalId}`,
    payload,
  );
  return data;
}
export async function cancelGoal(id: string, goalId: string): Promise<void> {
  await athleteClient.delete(`/api/v1/athletes/${id}/goals/${goalId}`);
}
export async function listTimeline(
  id: string,
  params: TimelineParams,
  signal?: AbortSignal,
): Promise<TimelineListResponse> {
  const { data } = await athleteClient.get<TimelineListResponse>(
    `/api/v1/athletes/${id}/timeline`,
    { params, signal },
  );
  return data;
}

export async function inviteAthlete(
  id: string,
  email: string,
): Promise<AthleteInvitation> {
  const { data } = await athleteClient.post<AthleteInvitation>(
    `/api/v1/athletes/${id}/invite`,
    { email },
  );
  return data;
}

export async function resendAthleteInvitation(
  id: string,
  email: string,
): Promise<AthleteInvitation> {
  const { data } = await athleteClient.post<AthleteInvitation>(
    `/api/v1/athletes/${id}/invite/resend`,
    { email },
  );
  return data;
}

export async function disableAthleteAccess(id: string): Promise<void> {
  await athleteClient.post(`/api/v1/athletes/${id}/access/disable`);
}
