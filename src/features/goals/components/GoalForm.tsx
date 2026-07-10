import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/common/Button";
import {
  FormField,
  Input,
  Select,
  Textarea,
} from "../../../components/forms/Fields";
import { formatEnum } from "../../../lib/formatters";
import {
  goalSchema,
  type GoalFormOutput,
  type GoalFormValues,
} from "../schemas/goal.schema";
import { goalCategories, goalStatuses, type Goal } from "../types";

export function GoalForm({
  goal,
  onSubmit,
  isPending,
}: {
  goal?: Goal;
  onSubmit: (values: GoalFormOutput) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<GoalFormValues, unknown, GoalFormOutput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title ?? "",
      description: goal?.description ?? "",
      category: goal?.category ?? "general",
      target_date: goal?.target_date ?? "",
      priority: goal?.priority ?? 3,
      status: goal?.status,
    },
  });
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        label="Title"
        htmlFor="goal_title"
        error={form.formState.errors.title?.message}
      >
        <Input id="goal_title" autoFocus {...form.register("title")} />
      </FormField>
      <FormField
        label="Description"
        htmlFor="goal_description"
        error={form.formState.errors.description?.message}
      >
        <Textarea id="goal_description" {...form.register("description")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="goal_category"
          error={form.formState.errors.category?.message}
        >
          <Select id="goal_category" {...form.register("category")}>
            {goalCategories.map((category) => (
              <option key={category} value={category}>
                {formatEnum(category)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Priority"
          htmlFor="goal_priority"
          error={form.formState.errors.priority?.message}
        >
          <Select id="goal_priority" {...form.register("priority")}>
            <option value="1">1 - Highest</option>
            <option value="2">2 - High</option>
            <option value="3">3 - Normal</option>
            <option value="4">4 - Low</option>
            <option value="5">5 - Lowest</option>
          </Select>
        </FormField>
        <FormField
          label="Target date"
          htmlFor="goal_target_date"
          error={form.formState.errors.target_date?.message}
        >
          <Input
            id="goal_target_date"
            type="date"
            {...form.register("target_date")}
          />
        </FormField>
        {goal && (
          <FormField
            label="Status"
            htmlFor="goal_status"
            error={form.formState.errors.status?.message}
          >
            <Select id="goal_status" {...form.register("status")}>
              {goalStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatEnum(status)}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending}>
          {goal ? "Save goal" : "Create goal"}
        </Button>
      </div>
    </form>
  );
}
