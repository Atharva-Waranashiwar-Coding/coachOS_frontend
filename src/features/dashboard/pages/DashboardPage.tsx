import { ArrowRight, CalendarClock, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import {
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { athleteName, formatDate, formatEnum } from "../../../lib/formatters";
import { useAthletes } from "../../athletes/hooks/useAthletes";
import { useAuth } from "../../auth/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const athletes = useAthletes({
    page: 1,
    page_size: 10,
    status: "active",
    sort_by: "updated_at",
    sort_order: "desc",
  });
  if (athletes.isLoading) return <LoadingSkeleton rows={4} />;
  if (athletes.isError)
    return (
      <ErrorState
        message={normalizeApiError(athletes.error).message}
        onRetry={() => athletes.refetch()}
      />
    );
  const data = athletes.data;
  const positions =
    data?.items.reduce<Record<string, number>>((totals, athlete) => {
      const key = athlete.primary_position ?? "unassigned";
      totals[key] = (totals[key] ?? 0) + 1;
      return totals;
    }, {}) ?? {};
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            Coach workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/athletes">
            <Button variant="secondary">View athletes</Button>
          </Link>
          <Link to="/athletes/new">
            <Button icon={Plus}>Add athlete</Button>
          </Link>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Active athletes</p>
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{data?.total ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">
            Organization records available to you
          </p>
        </Card>
        <Card className="p-5 md:col-span-2">
          <p className="text-sm font-medium text-gray-600">
            Positions in this view
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(positions).length ? (
              Object.entries(positions).map(([position, count]) => (
                <span
                  key={position}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm"
                >
                  <strong>{count}</strong> {formatEnum(position)}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No position data available.
              </p>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Based on the {data?.items.length ?? 0} recently updated active
            athletes loaded here.
          </p>
        </Card>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recently updated</h2>
            <p className="mt-1 text-sm text-gray-600">
              Your most recently changed active athlete records.
            </p>
          </div>
          <Link
            to="/athletes"
            className="flex items-center gap-1 text-sm font-semibold text-brand-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Card className="divide-y divide-line overflow-hidden">
          {data?.items.length ? (
            data.items.slice(0, 5).map((athlete) => (
              <Link
                key={athlete.id}
                to={`/athletes/${athlete.id}`}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{athleteName(athlete)}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatEnum(athlete.primary_position)} ·{" "}
                    {athlete.team_name ??
                      athlete.school_name ??
                      "No team listed"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatDate(athlete.updated_at)}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center">
              <CalendarClock className="mx-auto h-6 w-6 text-gray-400" />
              <p className="mt-3 text-sm text-gray-600">
                No active athletes yet.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
