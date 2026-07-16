import { useQuery } from "@tanstack/react-query";
import * as api from "../../api/insights.api";
import { queryKeys } from "../../api/query-keys";

function hasCompleteRange(filters: api.InsightFilters) {
  return (
    filters.range !== "custom" ||
    Boolean(filters.start_date && filters.end_date)
  );
}

export function useAthleteInsights(
  athleteId: string,
  filters: api.InsightFilters,
) {
  return useQuery({
    queryKey: queryKeys.insights.athlete(athleteId, filters),
    queryFn: ({ signal }) => api.getAthleteInsights(athleteId, filters, signal),
    enabled: Boolean(athleteId) && hasCompleteRange(filters),
    placeholderData: (previous) => previous,
    staleTime: 180_000,
  });
}

export function useCoachInsights(filters: api.InsightFilters) {
  return useQuery({
    queryKey: queryKeys.insights.coach(filters),
    queryFn: ({ signal }) => api.getCoachInsights(filters, signal),
    enabled: hasCompleteRange(filters),
    placeholderData: (previous) => previous,
    staleTime: 180_000,
  });
}

export function useCoachAttention(
  filters: Parameters<typeof api.getCoachAttention>[0],
) {
  return useQuery({
    queryKey: queryKeys.insights.attention(filters),
    queryFn: ({ signal }) => api.getCoachAttention(filters, signal),
    enabled: hasCompleteRange(filters),
    placeholderData: (previous) => previous,
    staleTime: 180_000,
  });
}
