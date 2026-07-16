import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../api/api-client";
import { Card } from "../../components/common/Card";
import { PageHeader } from "../../components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { formatDate } from "../../lib/formatters";
import {
  CompletenessNotice,
  InsightRangeControls,
  MetricCard,
} from "./components";
import { useCoachInsights } from "./hooks";
import { useInsightFilters } from "./useInsightFilters";

export function CoachInsightsPage() {
  const { filters, update } = useInsightFilters();
  const query = useCoachInsights(filters);
  if (query.isLoading) return <PageLoading label="Loading coach insights" />;
  if (query.isError)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  if (!query.data) return null;
  const data = query.data;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress insights"
        description="Coach-wide activity, completion, feedback, and workflow signals without athlete ranking."
      />
      <InsightRangeControls filters={filters} onChange={update} />
      <CompletenessNotice data={data.data_completeness} />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active athletes"
          value={data.active_athlete_count}
          help="Active athletes connected to your coach account."
        />
        <MetricCard
          label="Need attention"
          value={data.athletes_with_attention_flags}
          help="Athletes with at least one deterministic workflow flag."
        />
        <MetricCard
          label="Overdue assignments"
          value={data.total_overdue_assignments}
          help="Active drill assignments past their due date."
        />
        <MetricCard
          label="Completed drills"
          value={data.completed_drills_during_period}
          help="Drill assignments completed during this period."
        />
        <MetricCard
          label="Approved reviews"
          value={data.approved_reviews_during_period}
          help="Approved review snapshots during this period."
        />
        <MetricCard
          label="Completed practices"
          value={data.completed_practice_sessions_during_period}
          help="Practice sessions completed during this period."
        />
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Attention preview</h2>
            <Link
              className="text-sm font-semibold text-brand-700"
              to={`/insights/attention?range=${filters.range}&compare=${filters.compare}`}
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {data.attention_items.length ? (
              data.attention_items.map((item) => (
                <Link
                  key={item.athlete.id}
                  to={`/athletes/${item.athlete.id}/insights`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.athlete.first_name} {item.athlete.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.attention_flags
                        .map((flag) => flag.title)
                        .join(", ")}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No athletes currently have attention flags.
              </p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold">Top recurring feedback areas</h2>
          <div className="mt-4 space-y-4">
            {data.top_recurring_improvement_areas.length ? (
              data.top_recurring_improvement_areas.map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{item.display_label}</p>
                    <span className="text-sm">
                      {item.distinct_review_count} reviews
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Latest mention {formatDate(item.last_seen_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Not enough approved feedback to identify recurring areas.
              </p>
            )}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="text-lg font-bold">Recent progress</h2>
        <div className="mt-4 divide-y divide-line">
          {data.recent_progress_items.length ? (
            data.recent_progress_items.map((item) => (
              <Link
                key={`${item.athlete_id}-${item.event_type}-${item.occurred_at}`}
                to={`/athletes/${item.athlete_id}/insights`}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-semibold">{item.athlete_name}</p>
                  <p className="text-sm text-gray-600">{item.title}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(item.occurred_at)}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No progress milestones were recorded in this period.
            </p>
          )}
        </div>
      </Card>
      {data.active_athlete_count === 0 && (
        <EmptyState
          title="No active athletes"
          description="Add an athlete before progress insights can be calculated."
          action={
            <Link
              className="inline-flex items-center gap-2 font-semibold text-brand-700"
              to="/athletes/new"
            >
              <Users className="h-4 w-4" /> Add athlete
            </Link>
          }
        />
      )}
    </div>
  );
}
