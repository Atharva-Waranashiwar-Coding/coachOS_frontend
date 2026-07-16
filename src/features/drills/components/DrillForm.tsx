import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
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
  drillSchema,
  type DrillFormOutput,
  type DrillFormValues,
} from "../schemas/drill.schema";
import { drillCategories, drillDifficulties, type Drill } from "../types";

export function DrillForm({
  drill,
  isPending,
  onSubmit,
}: {
  drill?: Drill;
  isPending: boolean;
  onSubmit: (values: DrillFormOutput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DrillFormValues>({
    resolver: zodResolver(drillSchema),
    defaultValues: {
      title: drill?.title ?? "",
      description: drill?.description ?? "",
      instructions: drill?.instructions ?? "",
      category: drill?.category ?? "general",
      difficulty: drill?.difficulty ?? "beginner",
      equipment: drill?.equipment.join(", ") ?? "",
      estimated_duration_minutes: drill?.estimated_duration_minutes ?? "",
      default_sets: drill?.default_sets ?? "",
      default_repetitions: drill?.default_repetitions ?? "",
      default_frequency: drill?.default_frequency ?? "",
      tags: drill?.tags.join(", ") ?? "",
      video_url: drill?.video_url ?? "",
    },
  });
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) =>
        onSubmit(values as unknown as DrillFormOutput),
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </FormField>
        <FormField
          label="Category"
          htmlFor="category"
          error={errors.category?.message}
        >
          <Select id="category" {...register("category")}>
            {drillCategories.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Difficulty"
          htmlFor="difficulty"
          error={errors.difficulty?.message}
        >
          <Select id="difficulty" {...register("difficulty")}>
            {drillDifficulties.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Estimated duration"
          htmlFor="estimated_duration_minutes"
          hint="Minutes"
          error={errors.estimated_duration_minutes?.message}
        >
          <Input
            id="estimated_duration_minutes"
            type="number"
            min="1"
            {...register("estimated_duration_minutes")}
          />
        </FormField>
      </div>
      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea id="description" {...register("description")} />
      </FormField>
      <FormField
        label="Instructions"
        htmlFor="instructions"
        error={errors.instructions?.message}
      >
        <Textarea
          id="instructions"
          className="min-h-40"
          {...register("instructions")}
        />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          label="Default sets"
          htmlFor="default_sets"
          error={errors.default_sets?.message}
        >
          <Input
            id="default_sets"
            type="number"
            min="1"
            {...register("default_sets")}
          />
        </FormField>
        <FormField
          label="Default repetitions"
          htmlFor="default_repetitions"
          error={errors.default_repetitions?.message}
        >
          <Input
            id="default_repetitions"
            type="number"
            min="1"
            {...register("default_repetitions")}
          />
        </FormField>
        <FormField
          label="Default frequency"
          htmlFor="default_frequency"
          error={errors.default_frequency?.message}
        >
          <Input id="default_frequency" {...register("default_frequency")} />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Equipment"
          htmlFor="equipment"
          hint="Comma-separated"
          error={errors.equipment?.message}
        >
          <Input id="equipment" {...register("equipment")} />
        </FormField>
        <FormField
          label="Tags"
          htmlFor="tags"
          hint="Comma-separated"
          error={errors.tags?.message}
        >
          <Input id="tags" {...register("tags")} />
        </FormField>
      </div>
      <FormField
        label="Demonstration video URL"
        htmlFor="video_url"
        error={errors.video_url?.message}
      >
        <Input id="video_url" type="url" {...register("video_url")} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" icon={Save} isLoading={isPending}>
          {drill ? "Save changes" : "Create drill"}
        </Button>
      </div>
    </form>
  );
}
