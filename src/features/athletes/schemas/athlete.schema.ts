import { z } from "zod";
import {
  athleteStatuses,
  batSides,
  positions,
  throwSides,
  type AthletePayload,
} from "../types";

const optionalText = z.string().trim();
const optionalPositiveNumber = (label: string, max: number) =>
  z
    .string()
    .refine(
      (value) =>
        !value ||
        (Number.isInteger(Number(value)) &&
          Number(value) > 0 &&
          Number(value) <= max),
      `${label} must be a positive whole number no greater than ${max}`,
    );

export const athleteSchema = z
  .object({
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z.string().trim().min(1, "Last name is required").max(100),
    preferred_name: optionalText,
    date_of_birth: z
      .string()
      .refine(
        (value) => !value || new Date(`${value}T00:00:00`) <= new Date(),
        "Date of birth cannot be in the future",
      ),
    email: z
      .string()
      .trim()
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "Enter a valid email",
      ),
    phone: optionalText,
    primary_position: z.union([z.enum(positions), z.literal("")]),
    secondary_positions: z.array(z.enum(positions)),
    bats: z.union([z.enum(batSides), z.literal("")]),
    throws: z.union([z.enum(throwSides), z.literal("")]),
    graduation_year: z
      .string()
      .refine(
        (value) =>
          !value ||
          (Number.isInteger(Number(value)) &&
            Number(value) >= 2020 &&
            Number(value) <= 2045),
        "Year must be between 2020 and 2045",
      ),
    school_name: optionalText,
    team_name: optionalText,
    height_inches: optionalPositiveNumber("Height", 100),
    weight_pounds: optionalPositiveNumber("Weight", 500),
    injury_notes: optionalText,
    general_notes: optionalText,
    status: z.enum(athleteStatuses).optional(),
  })
  .superRefine((values, context) => {
    if (
      values.primary_position &&
      values.secondary_positions.includes(values.primary_position)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["secondary_positions"],
        message: "Secondary positions cannot include the primary position",
      });
    }
  });

export type AthleteFormValues = z.infer<typeof athleteSchema>;
export type AthleteFormOutput = AthletePayload;

export function toAthletePayload(values: AthleteFormValues): AthletePayload {
  const nullable = (value: string) => value || null;
  return {
    ...values,
    preferred_name: nullable(values.preferred_name),
    date_of_birth: nullable(values.date_of_birth),
    email: nullable(values.email),
    phone: nullable(values.phone),
    primary_position: values.primary_position || null,
    bats: values.bats || null,
    throws: values.throws || null,
    graduation_year: values.graduation_year
      ? Number(values.graduation_year)
      : null,
    school_name: nullable(values.school_name),
    team_name: nullable(values.team_name),
    height_inches: values.height_inches ? Number(values.height_inches) : null,
    weight_pounds: values.weight_pounds ? Number(values.weight_pounds) : null,
    injury_notes: nullable(values.injury_notes),
    general_notes: nullable(values.general_notes),
  };
}
