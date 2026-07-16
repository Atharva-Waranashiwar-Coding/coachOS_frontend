import { athleteClient } from "./api-client";
import type { AthleteGoal, Page } from "../features/athlete-dashboard/types";

export async function getAthleteGoals(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<Page<AthleteGoal>> {
  const { data } = await athleteClient.get<Page<AthleteGoal>>(
    "/api/v1/athlete/goals",
    { params, signal },
  );
  return data;
}
