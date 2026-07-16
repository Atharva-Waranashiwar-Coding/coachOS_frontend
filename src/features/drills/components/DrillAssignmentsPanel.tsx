import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { formatDate, formatEnum } from "../../../lib/formatters";
import { useAssignments } from "../hooks/useDrills";
import { assignmentStatuses, type AssignmentStatus } from "../types";
import { AssignDrillDialog } from "./AssignDrillDialog";

const tones = {
  assigned: "blue",
  in_progress: "amber",
  completed: "green",
  cancelled: "red",
} as const;

export function DrillAssignmentsPanel({ athleteId }: { athleteId: string }) {
  const [params, setParams] = useSearchParams();
  const status = (params.get("drill_status") || undefined) as
    AssignmentStatus | undefined;
  const priority = Number(params.get("drill_priority")) || undefined;
  const page = Math.max(1, Number(params.get("drill_page")) || 1);
  const reviewId = params.get("review_id") ?? "";
  const recommendationIndex = Number(params.get("recommendation"));
  const [assigning, setAssigning] = useState(params.get("assign") === "review");
  useEffect(() => {
    if (params.get("assign") === "review") setAssigning(true);
  }, [params]);
  const query = useAssignments(athleteId, {
    status,
    priority,
    page,
    page_size: 10,
    sort_by: "assigned_at",
    sort_order: "desc",
  });
  const update = (key: string, value: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("drill_page");
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
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="flex gap-2">
          <Select
            aria-label="Assignment status"
            value={status ?? ""}
            onChange={(event) => update("drill_status", event.target.value)}
          >
            <option value="">All statuses</option>
            {assignmentStatuses.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Assignment priority"
            value={priority ?? ""}
            onChange={(event) => update("drill_priority", event.target.value)}
          >
            <option value="">All priorities</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                Priority {value}
              </option>
            ))}
          </Select>
        </div>
        <Button icon={Plus} onClick={() => setAssigning(true)}>
          Assign drill
        </Button>
      </div>
      {!query.data.items.length ? (
        <EmptyState
          title="No drill assignments"
          description={
            status || priority
              ? "No assignments match the selected filters."
              : "Assign a library drill, an approved recommendation, or a custom drill."
          }
          action={
            <Button icon={Plus} onClick={() => setAssigning(true)}>
              Assign drill
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3">
            {query.data.items.map((assignment) => (
              <Card key={assignment.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/athletes/${athleteId}/drills/${assignment.id}`}
                        className="font-bold hover:text-brand-700"
                      >
                        {assignment.title_snapshot}
                      </Link>
                      <Badge tone={tones[assignment.status]}>
                        {formatEnum(assignment.status)}
                      </Badge>
                      <Badge>Priority {assignment.priority}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {assignment.description_snapshot ||
                        assignment.instructions_snapshot}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        Due {formatDate(assignment.due_date)}
                      </span>
                      <span>{assignment.completion_percentage}% complete</span>
                      <span>
                        {assignment.source_review_id
                          ? "AI review"
                          : assignment.drill_id
                            ? "Library"
                            : "Custom"}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/athletes/${athleteId}/drills/${assignment.id}`}
                    aria-label={`View ${assignment.title_snapshot}`}
                    className="self-end rounded p-2 text-gray-500 hover:bg-gray-100 sm:self-center"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
                  aria-label={`${assignment.completion_percentage}% complete`}
                >
                  <div
                    className="h-full bg-brand-600"
                    style={{ width: `${assignment.completion_percentage}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={query.data.page}
            totalPages={query.data.total_pages}
            total={query.data.total}
            onPageChange={(value) =>
              setParams((current) => {
                const next = new URLSearchParams(current);
                next.set("drill_page", String(value));
                return next;
              })
            }
          />
        </>
      )}
      <AssignDrillDialog
        athleteId={athleteId}
        open={assigning}
        initialReviewId={reviewId}
        initialRecommendationIndex={
          Number.isFinite(recommendationIndex) ? recommendationIndex : undefined
        }
        onClose={() => {
          setAssigning(false);
          setParams((current) => {
            const next = new URLSearchParams(current);
            ["assign", "review_id", "recommendation"].forEach((key) =>
              next.delete(key),
            );
            return next;
          });
        }}
      />
    </section>
  );
}
