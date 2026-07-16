import { athleteClient } from "./api-client";
import type {
  AthleteTimelineEvent,
  Page,
} from "../features/athlete-dashboard/types";

export async function getAthleteTimeline(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<Page<AthleteTimelineEvent>> {
  const { data } = await athleteClient.get<Page<AthleteTimelineEvent>>(
    "/api/v1/athlete/timeline",
    {
      params,
      signal,
    },
  );
  return data;
}
