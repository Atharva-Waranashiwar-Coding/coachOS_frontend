import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { ErrorState, PageLoading } from "../../components/feedback/States";
import { formatDate, formatEnum } from "../../lib/formatters";
import { useAthleteDashboard } from "./hooks";

export function AthleteDashboardPage() {
  const query = useAthleteDashboard();
  if (query.isLoading) return <PageLoading label="Loading your dashboard" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Your dashboard could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  const data = query.data;
  const name = data.athlete.preferred_name ?? data.athlete.first_name;
  const nextDue = data.upcoming_due_assignments[0];
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-brand-700">
          Athlete dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold">Welcome, {name}</h1>
        <p className="mt-2 text-gray-600">{data.progress_status.reason}</p>
      </header>
      {data.partial_data && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          Feedback totals are temporarily unavailable. Your training data is
          current.
        </div>
      )}
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Progress summary"
      >
        <Card className="p-5">
          <p className="text-sm text-gray-500">Current status</p>
          <p className="mt-2 text-xl font-bold">{data.progress_status.label}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Active drills</p>
          <p className="mt-2 text-2xl font-bold">{data.drill_summary.active}</p>
        </Card>
        <Card
          className={`p-5 ${data.drill_summary.overdue ? "border-amber-300 bg-amber-50" : ""}`}
        >
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="mt-2 text-2xl font-bold">
            {data.drill_summary.overdue}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Completed drills</p>
          <p className="mt-2 text-2xl font-bold">
            {data.drill_summary.completed}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.drill_summary.completion_rate}% completion rate
          </p>
        </Card>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Continue training</h2>
            <Link
              className="text-sm font-semibold text-brand-700"
              to="/athlete/drills"
            >
              View drills
            </Link>
          </div>
          {nextDue ? (
            <div className="mt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{nextDue.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Due {formatDate(nextDue.due_date)} ·{" "}
                    {nextDue.completion_percentage}% complete
                  </p>
                </div>
                <CalendarClock className="h-5 w-5 text-brand-600" />
              </div>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
                to={`/athlete/drills/${nextDue.id}`}
              >
                Continue training <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm text-gray-600">No drills assigned.</p>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Coach feedback</h2>
            <MessageSquareText className="h-5 w-5 text-brand-600" />
          </div>
          {data.feedback_summary.available &&
          data.feedback_summary.athlete_visible_approved_count ? (
            <>
              <p className="mt-5 text-3xl font-bold">
                {data.feedback_summary.athlete_visible_approved_count}
              </p>
              <p className="text-sm text-gray-600">
                approved feedback reviews available
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
                to="/athlete/feedback"
              >
                View feedback <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p className="mt-5 text-sm text-gray-600">
              No approved feedback yet.
            </p>
          )}
        </Card>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Active goals</h2>
          {data.active_goals.length ? (
            <ul className="mt-4 divide-y divide-line">
              {data.active_goals.map((goal) => (
                <li key={goal.id} className="py-3">
                  <p className="font-semibold">{goal.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatEnum(goal.category)} · Target{" "}
                    {formatDate(goal.target_date)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No goals available.</p>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Recent activity</h2>
          {data.recent_timeline.length ? (
            <ul className="mt-4 space-y-4">
              {data.recent_timeline.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.occurred_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No recent activity.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
