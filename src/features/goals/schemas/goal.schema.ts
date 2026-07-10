import { z } from "zod";
import { goalCategories, goalStatuses } from "../types";
export const goalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .transform((value) => value || null),
  category: z.enum(goalCategories),
  target_date: z.string().transform((value) => value || null),
  priority: z.coerce.number().int().min(1).max(5),
  status: z.enum(goalStatuses).optional(),
});
export type GoalFormValues = z.input<typeof goalSchema>;
export type GoalFormOutput = z.output<typeof goalSchema>;
