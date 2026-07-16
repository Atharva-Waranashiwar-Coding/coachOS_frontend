import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../../components/common/Card";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { Pagination } from "../../components/navigation/Pagination";
import { formatDate, formatEnum } from "../../lib/formatters";
import { useAthleteAssignments } from "../athlete-dashboard/hooks";

export function AthleteDrillsPage() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "completed" ? "completed" : "current";
  const page = Number(params.get("page") ?? 1);
  const status = view === "completed" ? "completed" : undefined;
  const query = useAthleteAssignments({ page, page_size: 10, status });
  const items =
    view === "current"
      ? query.data?.items.filter(
          (item) => item.status !== "completed" && item.status !== "cancelled",
        )
      : (query.data?.items ?? []);
  if (query.isLoading) return <PageLoading label="Loading drills" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Your drills could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Training drills</h1>
        <p className="mt-2 text-gray-600">
          Start, track, and complete work assigned by your coach.
        </p>
      </header>
      <div
        className="inline-flex rounded-md border border-line bg-white p-1"
        aria-label="Drill status"
      >
        {(["current", "completed"] as const).map((value) => (
          <button
            key={value}
            className={`min-h-10 rounded px-4 text-sm font-semibold capitalize ${view === value ? "bg-brand-600 text-white" : "text-gray-600"}`}
            onClick={() =>
              setParams(value === "current" ? {} : { view: value })
            }
          >
            {value}
          </button>
        ))}
      </div>
      {items?.length ? (
        <div className="space-y-3">
          {items.map((assignment) => (
            <Link
              key={assignment.id}
              to={`/athlete/drills/${assignment.id}`}
              className="block"
            >
              <Card className="p-5 transition hover:border-brand-500">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold">{assignment.title}</h2>
                      {assignment.overdue && (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                      {assignment.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatEnum(assignment.status)} · Due{" "}
                      {formatDate(assignment.due_date)} · Priority{" "}
                      {assignment.priority}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {assignment.completion_percentage}%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded bg-gray-100">
                  <div
                    className="h-full bg-brand-600"
                    style={{ width: `${assignment.completion_percentage}%` }}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            view === "completed" ? "No completed drills" : "No drills assigned"
          }
          description={
            view === "completed"
              ? "Completed assignments will appear here."
              : "New assignments from your coach will appear here."
          }
        />
      )}
      <Pagination
        page={query.data.page}
        totalPages={query.data.total_pages}
        total={query.data.total}
        onPageChange={(next) => {
          const updated = new URLSearchParams(params);
          updated.set("page", String(next));
          setParams(updated);
        }}
      />
    </div>
  );
}
