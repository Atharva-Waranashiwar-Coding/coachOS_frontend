import { z } from "zod";
import { drillCategories, drillDifficulties } from "../types";

const optionalPositive = z
  .union([z.literal(""), z.coerce.number().int().positive()])
  .transform((value) => (value === "" ? null : value));
const lines = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
);

export const drillSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .transform((value) => value || null),
  instructions: z
    .string()
    .trim()
    .min(1, "Instructions are required")
    .max(10000),
  category: z.enum(drillCategories),
  difficulty: z.enum(drillDifficulties),
  equipment: lines,
  estimated_duration_minutes: optionalPositive,
  default_sets: optionalPositive,
  default_repetitions: optionalPositive,
  default_frequency: z
    .string()
    .trim()
    .transform((value) => value || null),
  tags: lines,
  video_url: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid HTTP or HTTPS URL",
    )
    .transform((value) => value || null),
});

export type DrillFormValues = z.input<typeof drillSchema>;
export type DrillFormOutput = z.output<typeof drillSchema>;
