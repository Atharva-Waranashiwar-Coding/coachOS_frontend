import { useQuery } from "@tanstack/react-query";
import { listTimeline } from "../../../api/athletes.api";
import { queryKeys } from "../../../api/query-keys";
import type { TimelineParams } from "../types";
export function useTimeline(athleteId: string, params: TimelineParams) {
  return useQuery({
    queryKey: queryKeys.athletes.timeline(athleteId, params),
    queryFn: ({ signal }) => listTimeline(athleteId, params, signal),
    enabled: Boolean(athleteId),
    staleTime: 20_000,
  });
}
