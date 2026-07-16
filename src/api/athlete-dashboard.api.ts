import { athleteClient } from "./api-client";
import type { AthleteDashboard } from "../features/athlete-dashboard/types";

export async function getAthleteDashboard(
  signal?: AbortSignal,
): Promise<AthleteDashboard> {
  const { data } = await athleteClient.get<AthleteDashboard>(
    "/api/v1/athlete/dashboard",
    { signal },
  );
  return data;
}
