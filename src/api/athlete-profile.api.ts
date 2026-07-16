import { athleteClient } from "./api-client";
import type { AthleteSelfProfile } from "../features/athlete-dashboard/types";

export async function getAthleteMe(
  signal?: AbortSignal,
): Promise<AthleteSelfProfile> {
  const { data } = await athleteClient.get<AthleteSelfProfile>(
    "/api/v1/athlete/me",
    { signal },
  );
  return data;
}
