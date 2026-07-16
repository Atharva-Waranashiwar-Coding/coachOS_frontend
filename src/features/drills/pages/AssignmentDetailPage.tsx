import { Ban, CheckCircle2, ExternalLink, Play, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { Dialog } from "../../../components/feedback/Dialog";
import { ErrorState, PageLoading } from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { Input, Select, Textarea } from "../../../components/forms/Fields";
import {
  formatDate,
  formatDateTime,
  formatEnum,
} from "../../../lib/formatters";
import {
  useAssignment,
  useCancelAssignment,
  useCompleteAssignment,
  useStartAssignment,
  useUpdateAssignment,
} from "../hooks/useDrills";

export function AssignmentDetailPage() {
  const { athleteId = "", assignmentId = "" } = useParams();
  const query = useAssignment(athleteId, assignmentId);
  const start = useStartAssignment(athleteId, assignmentId);
  const complete = useCompleteAssignment(athleteId, assignmentId);
  const cancel = useCancelAssignment(athleteId, assignmentId);
  const update = useUpdateAssignment(athleteId, assignmentId);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { showToast } = useToast();
  if (query.isLoading) return <PageLoading label="Loading drill assignment" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    );
  const assignment = query.data;
  const terminal = ["completed", "cancelled"].includes(assignment.status);
  const runStart = async () => {
    try {
      await start.mutateAsync();
      showToast("Assignment started");
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={assignment.title_snapshot}
        description={`Assigned ${formatDateTime(assignment.assigned_at)} · Priority ${assignment.priority}`}
        actions={
          <>
            <Badge
              tone={
                assignment.status === "completed"
                  ? "green"
                  : assignment.status === "cancelled"
                    ? "red"
                    : assignment.status === "in_progress"
                      ? "amber"
                      : "blue"
              }
            >
              {formatEnum(assignment.status)}
            </Badge>
            {assignment.status === "assigned" && (
              <Button
                icon={Play}
                isLoading={start.isPending}
                onClick={runStart}
              >
                Start
              </Button>
            )}
            {!terminal && (
              <>
                <Button
                  icon={CheckCircle2}
                  onClick={() => setCompletionOpen(true)}
                >
                  Complete
                </Button>
                <Button
                  variant="danger"
                  icon={Ban}
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel
                </Button>
              </>
            )}
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-5">
          <Card className="p-5">
            <h2 className="font-bold">Instructions</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {assignment.instructions_snapshot}
            </p>
            {assignment.description_snapshot && (
              <>
                <h2 className="mt-6 font-bold">Description</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {assignment.description_snapshot}
                </p>
              </>
            )}
          </Card>
          {!terminal && (
            <AssignmentEditForm
              assignment={assignment}
              isPending={update.isPending}
              onSubmit={async (payload) => {
                try {
                  await update.mutateAsync(payload);
                  showToast("Assignment updated");
                } catch (error) {
                  showToast(normalizeApiError(error).message, "error");
                }
              }}
            />
          )}
          <Card className="p-5">
            <h2 className="font-bold">Activity</h2>
            <ol className="mt-4 divide-y divide-line">
              {assignment.activities.map((activity) => (
                <li key={activity.id} className="py-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">
                      {formatEnum(activity.event_type)}
                    </span>
                    <time className="text-xs text-gray-500">
                      {formatDateTime(activity.occurred_at)}
                    </time>
                  </div>
                  {activity.progress_value != null && (
                    <p className="mt-1 text-gray-600">
                      Progress: {activity.progress_value}%
                    </p>
                  )}
                  {activity.notes && (
                    <p className="mt-1 text-gray-600">{activity.notes}</p>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </section>
        <aside className="panel h-fit p-5">
          <h2 className="font-bold">Assignment</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Detail
              label="Start date"
              value={formatDate(assignment.start_date)}
            />
            <Detail label="Due date" value={formatDate(assignment.due_date)} />
            <Detail
              label="Target"
              value={
                [
                  assignment.target_sets
                    ? `${assignment.target_sets} sets`
                    : null,
                  assignment.target_repetitions
                    ? `${assignment.target_repetitions} reps`
                    : null,
                  assignment.target_duration_minutes
                    ? `${assignment.target_duration_minutes} minutes`
                    : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not set"
              }
            />
            <Detail
              label="Frequency"
              value={assignment.frequency ?? "Not set"}
            />
            <Detail
              label="Progress"
              value={`${assignment.completion_percentage}%`}
            />
            <Detail
              label="Source"
              value={
                assignment.source_review_id
                  ? "Approved AI review"
                  : assignment.drill_id
                    ? "Drill library"
                    : "Custom assignment"
              }
            />
          </dl>
          {assignment.drill_id && (
            <Link
              to={`/drills/${assignment.drill_id}`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
            >
              Open source drill <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          {assignment.coach_notes && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Private coach notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {assignment.coach_notes}
              </p>
            </div>
          )}
        </aside>
      </div>
      <CompletionDialog
        open={completionOpen}
        isPending={complete.isPending}
        onClose={() => setCompletionOpen(false)}
        onSubmit={async (payload) => {
          try {
            await complete.mutateAsync(payload);
            showToast("Assignment completed");
            setCompletionOpen(false);
          } catch (error) {
            showToast(normalizeApiError(error).message, "error");
          }
        }}
      />
      <CancellationDialog
        open={cancelOpen}
        isPending={cancel.isPending}
        onClose={() => setCancelOpen(false)}
        onSubmit={async (reason) => {
          try {
            await cancel.mutateAsync(reason);
            showToast("Assignment cancelled");
            setCancelOpen(false);
          } catch (error) {
            showToast(normalizeApiError(error).message, "error");
          }
        }}
      />
    </div>
  );
}

function AssignmentEditForm({
  assignment,
  isPending,
  onSubmit,
}: {
  assignment: NonNullable<ReturnType<typeof useAssignment>["data"]>;
  isPending: boolean;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [priority, setPriority] = useState(String(assignment.priority));
  const [dueDate, setDueDate] = useState(assignment.due_date ?? "");
  const [progress, setProgress] = useState(
    String(assignment.completion_percentage),
  );
  const [notes, setNotes] = useState(assignment.coach_notes ?? "");
  useEffect(() => {
    setPriority(String(assignment.priority));
    setDueDate(assignment.due_date ?? "");
    setProgress(String(assignment.completion_percentage));
    setNotes(assignment.coach_notes ?? "");
  }, [assignment]);
  return (
    <Card className="p-5">
      <h2 className="font-bold">Update assignment</h2>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            priority: Number(priority),
            due_date: dueDate || null,
            completion_percentage: Number(progress),
            coach_notes: notes || null,
          });
        }}
      >
        <label>
          <span className="label">Priority</span>
          <Select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="label">Due date</span>
          <Input
            type="date"
            min={assignment.start_date ?? undefined}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Progress: {progress}%</span>
          <Input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Private coach notes</span>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" icon={Save} isLoading={isPending}>
            Save assignment
          </Button>
        </div>
      </form>
    </Card>
  );
}

function CompletionDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    completion_notes?: string | null;
    actual_sets?: number | null;
    actual_repetitions?: number | null;
    actual_duration_minutes?: number | null;
  }) => Promise<void>;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [duration, setDuration] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Complete assignment?"
      description="Completion details remain coach-only in this MVP. The athlete timeline receives only a safe completion event."
    >
      <form
        className="space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void onSubmit({
            completion_notes: notes || null,
            actual_sets: nullableNumber(sets),
            actual_repetitions: nullableNumber(repetitions),
            actual_duration_minutes: nullableNumber(duration),
          });
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          <Input
            aria-label="Actual sets"
            type="number"
            min="1"
            placeholder="Sets"
            value={sets}
            onChange={(event) => setSets(event.target.value)}
          />
          <Input
            aria-label="Actual repetitions"
            type="number"
            min="1"
            placeholder="Reps"
            value={repetitions}
            onChange={(event) => setRepetitions(event.target.value)}
          />
          <Input
            aria-label="Actual duration"
            type="number"
            min="1"
            placeholder="Minutes"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
        </div>
        <Textarea
          aria-label="Completion notes"
          placeholder="Optional private completion notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Keep open
          </Button>
          <Button type="submit" icon={CheckCircle2} isLoading={isPending}>
            Confirm completion
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function CancellationDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string | null) => Promise<void>;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cancel assignment?"
      description="The optional reason is private and is never included in the athlete timeline."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(reason || null);
        }}
      >
        <Textarea
          aria-label="Cancellation reason"
          placeholder="Optional private reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Keep assignment
          </Button>
          <Button
            type="submit"
            variant="danger"
            icon={Ban}
            isLoading={isPending}
          >
            Confirm cancellation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-800">{value}</dd>
    </div>
  );
}

function nullableNumber(value: string): number | null {
  return value ? Number(value) : null;
}
