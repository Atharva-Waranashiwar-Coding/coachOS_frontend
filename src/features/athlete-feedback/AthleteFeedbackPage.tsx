import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Pagination } from "../../components/navigation/Pagination";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { formatDate, formatEnum } from "../../lib/formatters";
import { useAthleteFeedback } from "../athlete-dashboard/hooks";

export function AthleteFeedbackPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const reviewType = params.get("review_type") ?? undefined;
  const query = useAthleteFeedback({
    page,
    page_size: 8,
    review_type: reviewType,
  });
  if (query.isLoading) return <PageLoading label="Loading feedback" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Feedback could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Coach feedback</h1>
        <p className="mt-2 text-gray-600">
          Feedback reviewed and approved by your coach.
        </p>
      </header>
      <label className="block max-w-xs text-sm font-medium">
        Review type
        <select
          className="control mt-1"
          value={reviewType ?? ""}
          onChange={(event) =>
            setParams(
              event.target.value ? { review_type: event.target.value } : {},
            )
          }
        >
          <option value="">All feedback</option>
          {[
            "general",
            "hitting",
            "pitching",
            "fielding",
            "throwing",
            "footwork",
            "mobility",
            "strength",
          ].map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </select>
      </label>
      {query.data.items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {query.data.items.map((item) => (
            <Card key={item.review_id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-brand-700">
                  {formatEnum(item.review_type)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(item.approved_at)}
                </span>
              </div>
              {item.athlete_message && (
                <p className="mt-4 font-semibold">{item.athlete_message}</p>
              )}
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.summary_excerpt}
              </p>
              <Link
                className="mt-5 inline-block text-sm font-semibold text-brand-700"
                to={`/athlete/feedback/${item.review_id}`}
              >
                View feedback
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No approved feedback yet"
          description="Coach-approved feedback will appear here."
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
