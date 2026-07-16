import { ArrowLeft, ClipboardList, MessageSquareText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "../../api/api-client";
import { Card } from "../../components/common/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState, PageLoading } from "../../components/feedback/States";
import { formatDate, formatEnum } from "../../lib/formatters";
import {
  AccessibleBars,
  AttentionFlags,
  CompletenessNotice,
  InsightRangeControls,
  MetricCard,
  RecurringItems,
} from "./components";
import { useAthleteInsights } from "./hooks";
import { useInsightFilters } from "./useInsightFilters";

function percent(value: number | null) {
  return value === null ? null : `${value.toFixed(1)}%`;
}

export function AthleteInsightsPage() {
  const { athleteId = "" } = useParams();
  const { filters, update } = useInsightFilters();
  const query = useAthleteInsights(athleteId, filters);
  if (query.isLoading) return <PageLoading label="Loading progress insights" />;
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
        title={`${data.athlete.preferred_name ?? data.athlete.first_name}'s progress insights`}
        description="Transparent trends calculated from CoachOS activity records."
        actions={
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            to={`/athletes/${athleteId}`}
          >
            <ArrowLeft className="h-4 w-4" /> Athlete profile
          </Link>
        }
      />
      <InsightRangeControls filters={filters} onChange={update} />
      <CompletenessNotice data={data.data_completeness} />
      <section>
        <h2 className="mb-3 text-lg font-bold">Progress summary</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Drill completion rate"
            value={percent(data.drills?.current.completion_rate ?? null)}
            comparison={data.drills?.completion_trend.percentage_point_change}
            help="Completed non-cancelled assignments divided by non-cancelled assignments created before the period end."
          />
          <MetricCard
            label="Completed drills"
            value={data.drills?.current.completed_during_period ?? null}
            help="Assignments completed during the selected period."
          />
          <MetricCard
            label="Goal completion rate"
            value={percent(data.goals?.current.completion_rate ?? null)}
            comparison={data.goals?.completion_trend.percentage_point_change}
            help="Completed non-cancelled goals divided by non-cancelled goals created before the period end."
          />
          <MetricCard
            label="Approved reviews"
            value={
              data.data_completeness.review_data_available
                ? (data.reviews?.approved_review_count.current ?? 0)
                : null
            }
            comparison={data.reviews?.approved_review_count.absolute_change}
            help="Coach-approved review snapshots in the selected period."
          />
        </div>
      </section>
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold">Attention flags</h2>
        <AttentionFlags flags={data.attention_flags ?? []} />
      </Card>
      <section>
        <h2 className="mb-3 text-lg font-bold">Activity overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Completed practices"
            value={
              data.data_completeness.media_data_available
                ? (data.activity?.practice_sessions_completed.current ?? 0)
                : null
            }
            comparison={
              data.activity?.practice_sessions_completed.absolute_change
            }
            help="Practice sessions completed during the selected period."
          />
          <MetricCard
            label="Videos uploaded"
            value={
              data.data_completeness.media_data_available
                ? (data.activity?.videos_uploaded.current ?? 0)
                : null
            }
            comparison={data.activity?.videos_uploaded.absolute_change}
            help="Non-deleted videos uploaded during the selected period."
          />
          <MetricCard
            label="Drills started"
            value={data.activity?.drills_started.current ?? 0}
            comparison={data.activity?.drills_started.absolute_change}
            help="Assignments with a recorded start event during the selected period."
          />
          <MetricCard
            label="Timeline milestones"
            value={data.activity?.athlete_visible_timeline_events.current ?? 0}
            comparison={
              data.activity?.athlete_visible_timeline_events.absolute_change
            }
            help="Athlete-visible timeline events recorded during the selected period."
          />
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-bold">Drill activity</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Active</span>
              <p className="text-xl font-bold">
                {data.drills?.current.active_count ?? 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Overdue</span>
              <p className="text-xl font-bold">
                {data.drills?.current.overdue_count ?? 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">On-time completion</span>
              <p className="font-semibold">
                {percent(
                  data.drills?.current.on_time_completion_rate ?? null,
                ) ?? "Not enough data"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Average duration</span>
              <p className="font-semibold">
                {data.drills?.current.average_completion_days == null
                  ? "Not enough data"
                  : `${data.drills.current.average_completion_days} days`}
              </p>
            </div>
          </div>
          <Link
            className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-700"
            to={`/athletes/${athleteId}?tab=drills`}
          >
            <ClipboardList className="h-4 w-4" /> View assignments
          </Link>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold">Goal activity</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Active</span>
              <p className="text-xl font-bold">
                {data.goals?.current.active_count ?? 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Completed</span>
              <p className="text-xl font-bold">
                {data.goals?.current.completed_during_period ?? 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Due soon</span>
              <p className="font-semibold">
                {data.goals?.current.due_next_14_days ?? 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Overdue</span>
              <p className="font-semibold">
                {data.goals?.current.overdue_count ?? 0}
              </p>
            </div>
          </div>
          <Link
            className="mt-5 inline-block text-sm font-semibold text-brand-700"
            to={`/athletes/${athleteId}?tab=goals`}
          >
            View goals
          </Link>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Goal categories</h2>
          <AccessibleBars
            title="Active and completed goals by category"
            values={Object.entries(
              data.goals?.current.category_distribution ?? {},
            ).map(([label, value]) => ({
              label: formatEnum(label),
              value,
            }))}
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Goal completions by week</h2>
          <AccessibleBars
            title="Weekly goal completions"
            values={(data.goals?.weekly_completions ?? []).map((item) => ({
              label: formatDate(item.period_start),
              value: item.value,
            }))}
          />
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">
            Recurring improvement areas
          </h2>
          <RecurringItems
            items={data.reviews?.recurring_improvement_areas ?? []}
            athleteId={athleteId}
            empty="No recurring improvement area met the review threshold."
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Recurring strengths</h2>
          <RecurringItems
            items={data.reviews?.recurring_strengths ?? []}
            athleteId={athleteId}
            empty="No recurring strength met the review threshold."
          />
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Drill completions by week</h2>
          <AccessibleBars
            title="Weekly drill completions"
            values={(data.drills?.weekly_completions ?? []).map((item) => ({
              label: formatDate(item.period_start),
              value: item.value,
            }))}
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Approved reviews by week</h2>
          {data.data_completeness.review_data_available ? (
            <AccessibleBars
              title="Weekly approved reviews"
              values={(data.reviews?.weekly_approved_reviews ?? []).map(
                (item) => ({
                  label: formatDate(item.period_start),
                  value: item.value,
                }),
              )}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Data temporarily unavailable.
            </p>
          )}
        </Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent milestones</h2>
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            to={`/athletes/${athleteId}/reviews`}
          >
            <MessageSquareText className="h-4 w-4" /> Feedback
          </Link>
        </div>
        <div className="mt-4 divide-y divide-line">
          {data.recent_milestones.length ? (
            data.recent_milestones.map((item) => (
              <div
                key={`${item.event_type}-${item.occurred_at}`}
                className="flex justify-between gap-4 py-3"
              >
                <span>{item.title}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(item.occurred_at)} · {formatEnum(item.event_type)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No recent milestones in this period.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
