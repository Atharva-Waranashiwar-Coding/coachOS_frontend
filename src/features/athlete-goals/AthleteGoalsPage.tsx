import { CheckCircle2, Target } from "lucide-react";
import { Card } from "../../components/common/Card";
import {
  EmptyState,
  ErrorState,
  PageLoading,
} from "../../components/feedback/States";
import { formatDate, formatEnum } from "../../lib/formatters";
import { useAthleteGoals } from "../athlete-dashboard/hooks";

export function AthleteGoalsPage() {
  const query = useAthleteGoals({ page: 1, page_size: 100 });
  if (query.isLoading) return <PageLoading label="Loading goals" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Your goals could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  const active = query.data.items.filter((goal) => goal.status === "active");
  const completed = query.data.items.filter(
    (goal) => goal.status === "completed",
  );
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold">Goals</h1>
        <p className="mt-2 text-gray-600">
          Coach-defined goals for your development plan.
        </p>
      </header>
      <GoalSection
        title="Active goals"
        items={active}
        empty="No goals available."
        icon="active"
      />
      <GoalSection
        title="Completed goals"
        items={completed}
        empty="No completed goals yet."
        icon="completed"
      />
    </div>
  );
}

function GoalSection({
  title,
  items,
  empty,
  icon,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    priority: number;
    target_date: string | null;
  }>;
  empty: string;
  icon: "active" | "completed";
}) {
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      {items.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {items.map((goal) => (
            <Card key={goal.id} className="p-5">
              <div className="flex gap-3">
                {icon === "active" ? (
                  <Target className="h-5 w-5 text-brand-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-brand-600" />
                )}
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  {goal.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {goal.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs font-semibold uppercase text-gray-500">
                    {formatEnum(goal.category)} · Priority {goal.priority} ·{" "}
                    {formatDate(goal.target_date)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            title={empty}
            description="Your coach manages goal definitions and status."
          />
        </div>
      )}
    </section>
  );
}
