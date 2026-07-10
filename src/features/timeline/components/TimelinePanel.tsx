import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Dumbbell,
  FilePenLine,
  Target,
  Video,
} from "lucide-react";
import { type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { Input, Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { formatDateTime, formatEnum } from "../../../lib/formatters";
import { useTimeline } from "../hooks/useTimeline";
import {
  eventCategories,
  type EventCategory,
  type TimelineEvent,
} from "../types";
import { safeMetadata } from "./safeMetadata";

const categoryIcons: Record<
  EventCategory,
  ComponentType<{ className?: string }>
> = {
  profile: FilePenLine,
  goal: Target,
  practice: CalendarDays,
  video: Video,
  ai_review: Bot,
  coach_review: CheckCircle2,
  drill: Dumbbell,
  system: Activity,
};
const eventTypes = [
  "athlete_created",
  "athlete_updated",
  "athlete_archived",
  "athlete_restored",
  "injury_note_updated",
  "goal_created",
  "goal_updated",
  "goal_completed",
  "goal_cancelled",
  "practice_session_created",
  "practice_session_completed",
  "practice_session_cancelled",
  "video_uploaded",
  "video_deleted",
  "ai_review_requested",
  "ai_review_generated",
  "ai_review_failed",
  "coach_review_edited",
  "coach_review_approved",
  "coach_review_rejected",
  "drill_assigned",
  "drill_updated",
  "drill_completed",
  "drill_cancelled",
];
function groupLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

export function TimelinePanel({ athleteId }: { athleteId: string }) {
  const [search, setSearch] = useSearchParams();
  const page = Math.max(1, Number(search.get("timeline_page")) || 1);
  const category = (search.get("event_category") || undefined) as
    EventCategory | undefined;
  const eventType = search.get("event_type") || undefined;
  const start = search.get("start_date") || undefined;
  const end = search.get("end_date") || undefined;
  const params = {
    page,
    page_size: 10,
    event_category: category,
    event_type: eventType,
    start_date: start ? new Date(`${start}T00:00:00`).toISOString() : undefined,
    end_date: end ? new Date(`${end}T23:59:59`).toISOString() : undefined,
  };
  const query = useTimeline(athleteId, params);
  const update = (key: string, value: string) =>
    setSearch((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("timeline_page");
      return next;
    });
  if (!query.data)
    return query.isError ? (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    ) : (
      <LoadingSkeleton rows={4} />
    );
  const groups = query.data.items.reduce<Record<string, TimelineEvent[]>>(
    (result, event) => {
      const key = groupLabel(event.occurred_at);
      (result[key] ??= []).push(event);
      return result;
    },
    {},
  );
  return (
    <section className="space-y-4">
      <div className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          aria-label="Timeline category"
          value={category ?? ""}
          onChange={(e) => update("event_category", e.target.value)}
        >
          <option value="">All categories</option>
          {eventCategories.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Timeline event type"
          value={eventType ?? ""}
          onChange={(e) => update("event_type", e.target.value)}
        >
          <option value="">All event types</option>
          {eventTypes.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          aria-label="Timeline start date"
          value={start ?? ""}
          onChange={(e) => update("start_date", e.target.value)}
        />
        <Input
          type="date"
          aria-label="Timeline end date"
          min={start}
          value={end ?? ""}
          onChange={(e) => update("end_date", e.target.value)}
        />
        <Button
          variant="ghost"
          onClick={() =>
            setSearch((current) => {
              const next = new URLSearchParams(current);
              [
                "event_category",
                "event_type",
                "start_date",
                "end_date",
                "timeline_page",
              ].forEach((key) => next.delete(key));
              return next;
            })
          }
        >
          Clear filters
        </Button>
      </div>
      {!query.data.items.length ? (
        <EmptyState
          title="No timeline activity"
          description="No events match the selected timeline filters."
        />
      ) : (
        Object.entries(groups).map(([label, events]) => (
          <section key={label}>
            <h3 className="mb-2 text-sm font-semibold text-gray-500">
              {label}
            </h3>
            <ol className="panel divide-y divide-line">
              {events.map((event) => {
                const Icon = categoryIcons[event.event_category] ?? CircleDot;
                const metadata = safeMetadata(event.metadata);
                return (
                  <li key={event.id} className="flex gap-4 p-5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge>{formatEnum(event.event_category)}</Badge>
                      </div>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {event.description}
                        </p>
                      )}
                      <time
                        className="mt-2 block text-xs text-gray-500"
                        dateTime={event.occurred_at}
                      >
                        {formatDateTime(event.occurred_at)} ·{" "}
                        {event.source_service}
                      </time>
                      {metadata.length > 0 && (
                        <dl className="mt-2 flex flex-wrap gap-x-4 text-xs text-gray-500">
                          {metadata.map((item) => (
                            <div key={item.label}>
                              <dt className="inline font-medium">
                                {item.label}:{" "}
                              </dt>
                              <dd className="inline">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
      <Pagination
        page={query.data.page}
        totalPages={query.data.total_pages}
        total={query.data.total}
        onPageChange={(value) => update("timeline_page", String(value))}
      />
    </section>
  );
}
