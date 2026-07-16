import { ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../api/api-client";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { PageHeader } from "../../components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { Pagination } from "../../components/navigation/Pagination";
import { formatDate, formatEnum } from "../../lib/formatters";
import { positions } from "../athletes/types";
import { CompletenessNotice, InsightRangeControls } from "./components";
import { useCoachAttention } from "./hooks";
import { useInsightFilters } from "./useInsightFilters";

export function AttentionInsightsPage() {
  const { filters, update } = useInsightFilters();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const query = useCoachAttention({
    ...filters,
    severity: params.get("severity") || undefined,
    flag_code: params.get("flag_code") || undefined,
    primary_position: params.get("primary_position") || undefined,
    search: params.get("search") || undefined,
    sort_by: params.get("sort_by") || "highest_severity",
    page,
    page_size: 20,
  });
  const set = (key: string, value: string) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", key === "page" ? value : "1");
      return next;
    });
  };
  if (query.isLoading) return <PageLoading label="Loading attention items" />;
  if (query.isError)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  if (!query.data) return null;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Athletes needing attention"
        description="Routine workflow flags derived from due dates, activity, goals, and approved feedback."
      />
      <InsightRangeControls filters={filters} onChange={update} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          aria-label="Search attention items"
          className="min-h-10 rounded-md border border-line px-3"
          placeholder="Search athlete"
          value={params.get("search") ?? ""}
          onChange={(event) => set("search", event.target.value)}
        />
        <select
          aria-label="Severity"
          className="min-h-10 rounded-md border border-line px-3"
          value={params.get("severity") ?? ""}
          onChange={(event) => set("severity", event.target.value)}
        >
          <option value="">All severities</option>
          <option value="high">High</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          aria-label="Flag"
          className="min-h-10 rounded-md border border-line px-3"
          value={params.get("flag_code") ?? ""}
          onChange={(event) => set("flag_code", event.target.value)}
        >
          <option value="">All flags</option>
          <option value="overdue_drills">Overdue drills</option>
          <option value="goal_overdue">Goal overdue</option>
          <option value="low_recent_activity">Low recent activity</option>
          <option value="repeated_high_priority_area">
            Repeated feedback area
          </option>
        </select>
        <select
          aria-label="Primary position"
          className="min-h-10 rounded-md border border-line px-3"
          value={params.get("primary_position") ?? ""}
          onChange={(event) => set("primary_position", event.target.value)}
        >
          <option value="">All positions</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {formatEnum(position)}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort attention items"
          className="min-h-10 rounded-md border border-line px-3"
          value={params.get("sort_by") ?? "highest_severity"}
          onChange={(event) => set("sort_by", event.target.value)}
        >
          <option value="highest_severity">Highest severity</option>
          <option value="overdue_count">Overdue count</option>
          <option value="last_activity">Last activity</option>
          <option value="name">Name</option>
        </select>
      </div>
      <CompletenessNotice data={query.data.data_completeness} />
      {query.data.items.length ? (
        <Card className="divide-y divide-line overflow-hidden">
          {query.data.items.map((item) => (
            <div
              key={item.athlete.id}
              className="grid gap-4 p-4 lg:grid-cols-[1.2fr_2fr_1fr_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold">
                  {item.athlete.first_name} {item.athlete.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatEnum(item.athlete.primary_position)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.attention_flags.map((flag) => (
                  <Badge
                    key={flag.code}
                    tone={
                      flag.severity === "high"
                        ? "red"
                        : flag.severity === "warning"
                          ? "amber"
                          : "gray"
                    }
                  >
                    {flag.title}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <p>{item.overdue_assignment_count} overdue</p>
                <p>
                  Last activity: {formatDate(item.last_qualifying_activity)}
                </p>
                <p>
                  Latest feedback:{" "}
                  {formatDate(item.latest_approved_feedback_date)}
                </p>
                <p>Next goal: {formatDate(item.next_goal_due_date)}</p>
              </div>
              <Link
                aria-label={`Open ${item.athlete.first_name} insights`}
                to={`/athletes/${item.athlete.id}/insights`}
                className="text-brand-700"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No matching attention items"
          description="No athletes match the current filters."
        />
      )}
      <Pagination
        page={page}
        totalPages={query.data.total_pages}
        total={query.data.total}
        onPageChange={(nextPage) => set("page", String(nextPage))}
      />
    </div>
  );
}
