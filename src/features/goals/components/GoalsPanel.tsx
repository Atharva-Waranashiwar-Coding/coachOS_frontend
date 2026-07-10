import { Check, Edit3, Pause, Play, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { ConfirmDialog, Dialog } from "../../../components/feedback/Dialog";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { formatDate, formatEnum } from "../../../lib/formatters";
import { GoalForm } from "./GoalForm";
import {
  useCancelGoal,
  useCreateGoal,
  useGoals,
  useUpdateGoal,
} from "../hooks/useGoals";
import type { GoalFormOutput } from "../schemas/goal.schema";
import {
  goalCategories,
  goalStatuses,
  type Goal,
  type GoalCategory,
  type GoalStatus,
} from "../types";

const tones: Record<GoalStatus, "green" | "blue" | "amber" | "gray"> = {
  active: "blue",
  completed: "green",
  paused: "amber",
  cancelled: "gray",
};
export function GoalsPanel({ athleteId }: { athleteId: string }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<GoalStatus | undefined>();
  const [category, setCategory] = useState<GoalCategory | undefined>();
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [cancelling, setCancelling] = useState<Goal | null>(null);
  const filters = { page, page_size: 10, status, category };
  const query = useGoals(athleteId, filters);
  const create = useCreateGoal(athleteId);
  const update = useUpdateGoal(athleteId);
  const cancel = useCancelGoal(athleteId);
  const { showToast } = useToast();
  const save = async (values: GoalFormOutput) => {
    try {
      if (editing === "new") {
        await create.mutateAsync({
          title: values.title,
          description: values.description,
          category: values.category,
          target_date: values.target_date,
          priority: values.priority,
        });
        showToast("Goal created");
      } else if (editing) {
        await update.mutateAsync({ goalId: editing.id, payload: values });
        showToast("Goal updated");
      }
      setEditing(null);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  const changeStatus = async (goal: Goal, next: GoalStatus) => {
    try {
      await update.mutateAsync({ goalId: goal.id, payload: { status: next } });
      showToast(next === "completed" ? "Goal completed" : `Goal ${next}`);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  if (!query.data)
    return query.isError ? (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    ) : (
      <LoadingSkeleton rows={3} />
    );
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="flex gap-2">
          <Select
            aria-label="Filter goals by status"
            value={status ?? ""}
            onChange={(event) => {
              setStatus((event.target.value as GoalStatus) || undefined);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {goalStatuses.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter goals by category"
            value={category ?? ""}
            onChange={(event) => {
              setCategory((event.target.value as GoalCategory) || undefined);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {goalCategories.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </div>
        <Button icon={Plus} onClick={() => setEditing("new")}>
          Add goal
        </Button>
      </div>
      {query.isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : query.isError ? (
        <ErrorState
          message={normalizeApiError(query.error).message}
          onRetry={() => query.refetch()}
        />
      ) : !query.data.items.length ? (
        <EmptyState
          title="No goals found"
          description={
            status || category
              ? "No goals match the selected filters."
              : "Create a goal to define the athlete's next development outcome."
          }
          action={
            !status && !category ? (
              <Button icon={Plus} onClick={() => setEditing("new")}>
                Create goal
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3">
            {query.data.items.map((goal) => (
              <Card key={goal.id} className="p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{goal.title}</h3>
                      <Badge tone={tones[goal.status]}>
                        {formatEnum(goal.status)}
                      </Badge>
                      <Badge>{formatEnum(goal.category)}</Badge>
                    </div>
                    {goal.description && (
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {goal.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      Priority {goal.priority} · Target{" "}
                      {formatDate(goal.target_date)}
                    </p>
                  </div>
                  {goal.status !== "cancelled" && (
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        icon={Edit3}
                        aria-label={`Edit ${goal.title}`}
                        onClick={() => setEditing(goal)}
                      >
                        Edit
                      </Button>
                      {goal.status === "active" && (
                        <Button
                          variant="ghost"
                          icon={Pause}
                          onClick={() => changeStatus(goal, "paused")}
                        >
                          Pause
                        </Button>
                      )}
                      {goal.status === "paused" && (
                        <Button
                          variant="ghost"
                          icon={Play}
                          onClick={() => changeStatus(goal, "active")}
                        >
                          Resume
                        </Button>
                      )}
                      {goal.status !== "completed" && (
                        <Button
                          variant="ghost"
                          icon={Check}
                          onClick={() => changeStatus(goal, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        icon={XCircle}
                        className="text-red-600"
                        onClick={() => setCancelling(goal)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={query.data.page}
            totalPages={query.data.total_pages}
            total={query.data.total}
            onPageChange={setPage}
          />
        </>
      )}
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Create goal" : "Edit goal"}
        description="Set a specific outcome and target date for this athlete."
      >
        {editing && (
          <GoalForm
            goal={editing === "new" ? undefined : editing}
            onSubmit={save}
            isPending={create.isPending || update.isPending}
          />
        )}
      </Dialog>
      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Cancel goal?"
        description="The goal will remain in the athlete's history but can no longer be active."
        confirmLabel="Cancel goal"
        destructive
        isPending={cancel.isPending}
        onConfirm={async () => {
          if (!cancelling) return;
          try {
            await cancel.mutateAsync(cancelling.id);
            showToast("Goal cancelled");
            setCancelling(null);
          } catch (error) {
            showToast(normalizeApiError(error).message, "error");
          }
        }}
      />
    </section>
  );
}
