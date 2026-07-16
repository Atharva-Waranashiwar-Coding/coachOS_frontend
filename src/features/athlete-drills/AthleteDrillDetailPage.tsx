import { ArrowLeft, Check, Play, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "../../api/api-client";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Dialog } from "../../components/feedback/Dialog";
import { ErrorState, PageLoading } from "../../components/feedback/States";
import { useToast } from "../../components/feedback/Toast";
import { Input, Textarea } from "../../components/forms/Fields";
import { formatDate, formatEnum } from "../../lib/formatters";
import {
  useAthleteAssignment,
  useCompleteAthleteAssignment,
  useStartAthleteAssignment,
  useUpdateAthleteProgress,
} from "../athlete-dashboard/hooks";

function optionalNumber(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

export function AthleteDrillDetailPage() {
  const { assignmentId = "" } = useParams();
  const query = useAthleteAssignment(assignmentId);
  const start = useStartAthleteAssignment(assignmentId);
  const progress = useUpdateAthleteProgress(assignmentId);
  const complete = useCompleteAthleteAssignment(assignmentId);
  const [progressOpen, setProgressOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const { showToast } = useToast();
  if (query.isLoading) return <PageLoading label="Loading drill" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="This drill assignment is unavailable."
        onRetry={() => query.refetch()}
      />
    );
  const assignment = query.data;
  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showToast(success);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  const submitProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(
      () =>
        progress.mutateAsync({
          completion_percentage: Number(form.get("completion_percentage")),
          actual_sets: optionalNumber(String(form.get("actual_sets") ?? "")),
          actual_repetitions: optionalNumber(
            String(form.get("actual_repetitions") ?? ""),
          ),
          actual_duration_minutes: optionalNumber(
            String(form.get("actual_duration_minutes") ?? ""),
          ),
          athlete_note: String(form.get("athlete_note") ?? "") || undefined,
        }),
      "Progress updated",
    ).then(() => setProgressOpen(false));
  };
  const submitCompletion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(
      () =>
        complete.mutateAsync({
          confirmation: true,
          actual_sets: optionalNumber(String(form.get("actual_sets") ?? "")),
          actual_repetitions: optionalNumber(
            String(form.get("actual_repetitions") ?? ""),
          ),
          actual_duration_minutes: optionalNumber(
            String(form.get("actual_duration_minutes") ?? ""),
          ),
          athlete_note: String(form.get("athlete_note") ?? "") || undefined,
        }),
      "Drill completed",
    ).then(() => setCompleteOpen(false));
  };
  const active =
    assignment.status === "assigned" || assignment.status === "in_progress";
  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
        to="/athlete/drills"
      >
        <ArrowLeft className="h-4 w-4" /> Back to drills
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            {formatEnum(assignment.status)}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{assignment.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Due {formatDate(assignment.due_date)} · Priority{" "}
            {assignment.priority}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {assignment.status === "assigned" && (
            <Button
              icon={Play}
              isLoading={start.isPending}
              onClick={() => run(() => start.mutateAsync(), "Drill started")}
            >
              Start
            </Button>
          )}
          {active && (
            <>
              <Button
                variant="secondary"
                icon={Save}
                onClick={() => setProgressOpen(true)}
              >
                Update progress
              </Button>
              <Button icon={Check} onClick={() => setCompleteOpen(true)}>
                Complete
              </Button>
            </>
          )}
        </div>
      </header>
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Progress</h2>
          <span className="font-semibold">
            {assignment.completion_percentage}%
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded bg-gray-100">
          <div
            className="h-full bg-brand-600"
            style={{ width: `${assignment.completion_percentage}%` }}
          />
        </div>
      </Card>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Instructions</h2>
          {assignment.description && (
            <p className="mt-3 text-gray-600">{assignment.description}</p>
          )}
          <p className="mt-5 whitespace-pre-wrap leading-7">
            {assignment.instructions}
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Targets</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Sets</dt>
              <dd className="font-semibold">
                {assignment.target_sets ?? "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Repetitions</dt>
              <dd className="font-semibold">
                {assignment.target_repetitions ?? "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Duration</dt>
              <dd className="font-semibold">
                {assignment.target_duration_minutes
                  ? `${assignment.target_duration_minutes} minutes`
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Frequency</dt>
              <dd className="font-semibold">
                {assignment.frequency ?? "Not set"}
              </dd>
            </div>
          </dl>
        </Card>
      </section>
      <Dialog
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        title="Update progress"
        description="Your coach can see the progress and note you submit."
      >
        <form className="space-y-4" onSubmit={submitProgress}>
          <label className="label" htmlFor="completion_percentage">
            Completion percentage
          </label>
          <Input
            id="completion_percentage"
            name="completion_percentage"
            type="number"
            min={assignment.completion_percentage}
            max={99}
            defaultValue={assignment.completion_percentage}
            required
          />
          <ActualFields />
          <label className="label" htmlFor="progress_note">
            Note for your coach
          </label>
          <Textarea id="progress_note" name="athlete_note" maxLength={3000} />
          <Button
            className="w-full"
            type="submit"
            icon={Save}
            isLoading={progress.isPending}
          >
            Save progress
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title="Complete assignment?"
        description="Confirm that you completed this drill. Your coach can review the details you submit."
      >
        <form className="space-y-4" onSubmit={submitCompletion}>
          <ActualFields />
          <label className="label" htmlFor="completion_note">
            Note for your coach
          </label>
          <Textarea id="completion_note" name="athlete_note" maxLength={3000} />
          <Button
            className="w-full"
            type="submit"
            icon={Check}
            isLoading={complete.isPending}
          >
            Confirm completion
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

function ActualFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm font-medium">
        Actual sets
        <Input name="actual_sets" type="number" min={1} className="mt-1" />
      </label>
      <label className="text-sm font-medium">
        Actual reps
        <Input
          name="actual_repetitions"
          type="number"
          min={1}
          className="mt-1"
        />
      </label>
      <label className="text-sm font-medium">
        Actual minutes
        <Input
          name="actual_duration_minutes"
          type="number"
          min={1}
          className="mt-1"
        />
      </label>
    </div>
  );
}
