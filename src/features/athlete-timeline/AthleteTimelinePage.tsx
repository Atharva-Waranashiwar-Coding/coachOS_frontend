import { Activity } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/common/Card";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { Pagination } from "../../components/navigation/Pagination";
import { formatDateTime, formatEnum } from "../../lib/formatters";
import { useAthleteTimeline } from "../athlete-dashboard/hooks";

export function AthleteTimelinePage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const eventCategory = params.get("event_category") ?? undefined;
  const query = useAthleteTimeline({
    page,
    page_size: 12,
    event_category: eventCategory,
  });
  if (query.isLoading) return <PageLoading label="Loading timeline" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Your timeline could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Timeline</h1>
        <p className="mt-2 text-gray-600">
          Your athlete-visible development history.
        </p>
      </header>
      <label className="block max-w-xs text-sm font-medium">
        Category
        <select
          className="control mt-1"
          value={eventCategory ?? ""}
          onChange={(event) =>
            setParams(
              event.target.value ? { event_category: event.target.value } : {},
            )
          }
        >
          <option value="">All activity</option>
          {[
            "goal",
            "practice",
            "video",
            "ai_review",
            "coach_review",
            "drill",
            "profile",
            "system",
          ].map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </select>
      </label>
      {query.data.items.length ? (
        <div className="space-y-3">
          {query.data.items.map((event) => (
            <Card key={event.id} className="flex gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50">
                <Activity className="h-5 w-5 text-brand-700" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{event.title}</h2>
                  <span className="text-xs text-gray-500">
                    {formatEnum(event.event_category)}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {event.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {formatDateTime(event.occurred_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recent activity"
          description="Athlete-visible events will appear here."
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
