import {
  Activity,
  Archive,
  Bot,
  CheckCircle2,
  CircleDot,
  Dumbbell,
  FilePenLine,
  PlusCircle,
  RotateCcw,
  Target,
  Upload,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { normalizeApiError } from "../../../api/api-client";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { Input, Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { formatDateTime, formatEnum } from "../../../lib/formatters";
import { useTimeline } from "../hooks/useTimeline";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  athlete_created: PlusCircle,
  athlete_updated: FilePenLine,
  athlete_archived: Archive,
  athlete_restored: RotateCcw,
  goal_created: Target,
  goal_updated: Target,
  goal_completed: CheckCircle2,
  goal_cancelled: Target,
  video_uploaded: Upload,
  ai_review_generated: Bot,
  coach_review_approved: CheckCircle2,
  drill_assigned: Dumbbell,
  workout_completed: Activity,
};
export function TimelinePanel({ athleteId }: { athleteId: string }) {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const params = {
    page,
    page_size: 10,
    event_type: eventType || undefined,
    start_date: startDate
      ? new Date(`${startDate}T00:00:00`).toISOString()
      : undefined,
    end_date: endDate
      ? new Date(`${endDate}T23:59:59`).toISOString()
      : undefined,
  };
  const query = useTimeline(athleteId, params);
  if (!query.data)
    return query.isError ? (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    ) : (
      <LoadingSkeleton rows={4} />
    );
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          aria-label="Timeline event type"
          value={eventType}
          onChange={(event) => {
            setEventType(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All activity</option>
          <option value="athlete_created">Athlete created</option>
          <option value="athlete_updated">Athlete updated</option>
          <option value="athlete_archived">Athlete archived</option>
          <option value="athlete_restored">Athlete restored</option>
          <option value="goal_created">Goal created</option>
          <option value="goal_updated">Goal updated</option>
          <option value="goal_completed">Goal completed</option>
          <option value="goal_cancelled">Goal cancelled</option>
        </Select>
        <Input
          type="date"
          aria-label="Timeline start date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          aria-label="Timeline end date"
          min={startDate || undefined}
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
            setPage(1);
          }}
        />
      </div>
      {query.isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : query.isError ? (
        <ErrorState
          message={normalizeApiError(query.error).message}
          onRetry={() => query.refetch()}
        />
      ) : !query.data.items.length ? (
        <EmptyState
          title="No timeline activity"
          description="Activity created by profile and goal changes will appear here."
        />
      ) : (
        <>
          <ol className="panel divide-y divide-line">
            {query.data.items.map((event) => {
              const Icon = icons[event.event_type] ?? CircleDot;
              return (
                <li key={event.id} className="flex gap-4 p-5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <time
                        className="text-xs text-gray-500"
                        dateTime={event.occurred_at}
                      >
                        {formatDateTime(event.occurred_at)}
                      </time>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {event.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {formatEnum(event.event_type)} · {event.source_service}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Pagination
            page={query.data.page}
            totalPages={query.data.total_pages}
            total={query.data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
