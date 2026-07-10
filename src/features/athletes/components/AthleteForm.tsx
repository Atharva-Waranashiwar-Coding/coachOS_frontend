import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm, type Path } from "react-hook-form";
import type { ApiError } from "../../../types/api";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import {
  FormField,
  Input,
  Select,
  Textarea,
} from "../../../components/forms/Fields";
import { formatEnum } from "../../../lib/formatters";
import {
  athleteSchema,
  toAthletePayload,
  type AthleteFormOutput,
  type AthleteFormValues,
} from "../schemas/athlete.schema";
import { batSides, positions, throwSides, type AthleteDetail } from "../types";

function defaults(athlete?: AthleteDetail): AthleteFormValues {
  return {
    first_name: athlete?.first_name ?? "",
    last_name: athlete?.last_name ?? "",
    preferred_name: athlete?.preferred_name ?? "",
    date_of_birth: athlete?.date_of_birth ?? "",
    email: athlete?.email ?? "",
    phone: athlete?.phone ?? "",
    primary_position: athlete?.primary_position ?? "",
    secondary_positions: athlete?.secondary_positions ?? [],
    bats: athlete?.bats ?? "",
    throws: athlete?.throws ?? "",
    graduation_year: athlete?.graduation_year
      ? String(athlete.graduation_year)
      : "",
    school_name: athlete?.school_name ?? "",
    team_name: athlete?.team_name ?? "",
    height_inches: athlete?.height_inches ? String(athlete.height_inches) : "",
    weight_pounds: athlete?.weight_pounds ? String(athlete.weight_pounds) : "",
    injury_notes: athlete?.injury_notes ?? "",
    general_notes: athlete?.general_notes ?? "",
    status: athlete?.status,
  };
}

export function AthleteForm({
  athlete,
  onSubmit,
  isPending,
  apiError,
}: {
  athlete?: AthleteDetail;
  onSubmit: (values: AthleteFormOutput) => Promise<void>;
  isPending: boolean;
  apiError?: ApiError | null;
}) {
  const form = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues: defaults(athlete),
  });
  useEffect(() => {
    apiError?.fieldErrors.forEach(({ field, message }) => {
      if (field in form.getValues())
        form.setError(field as Path<AthleteFormValues>, {
          type: "server",
          message,
        });
    });
  }, [apiError, form]);
  const submit = form.handleSubmit(async (values) => {
    await onSubmit(toAthletePayload(values));
  });
  const errors = form.formState.errors;
  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {apiError && !apiError.fieldErrors.length && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {apiError.message}
        </div>
      )}
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">Identity</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="First name"
            htmlFor="first_name"
            error={errors.first_name?.message}
          >
            <Input
              id="first_name"
              autoComplete="given-name"
              {...form.register("first_name")}
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="last_name"
            error={errors.last_name?.message}
          >
            <Input
              id="last_name"
              autoComplete="family-name"
              {...form.register("last_name")}
            />
          </FormField>
          <FormField
            label="Preferred name"
            htmlFor="preferred_name"
            error={errors.preferred_name?.message}
          >
            <Input id="preferred_name" {...form.register("preferred_name")} />
          </FormField>
          <FormField
            label="Date of birth"
            htmlFor="date_of_birth"
            error={errors.date_of_birth?.message}
          >
            <Input
              id="date_of_birth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              {...form.register("date_of_birth")}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="phone"
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...form.register("phone")}
            />
          </FormField>
        </div>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">Playing profile</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Primary position"
            htmlFor="primary_position"
            error={errors.primary_position?.message}
          >
            <Select
              id="primary_position"
              {...form.register("primary_position")}
            >
              <option value="">Select position</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {formatEnum(position)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Bats" htmlFor="bats" error={errors.bats?.message}>
            <Select id="bats" {...form.register("bats")}>
              <option value="">Not provided</option>
              {batSides.map((side) => (
                <option key={side} value={side}>
                  {formatEnum(side)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Throws"
            htmlFor="throws"
            error={errors.throws?.message}
          >
            <Select id="throws" {...form.register("throws")}>
              <option value="">Not provided</option>
              {throwSides.map((side) => (
                <option key={side} value={side}>
                  {formatEnum(side)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <fieldset className="mt-5">
          <legend className="label">Secondary positions</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {positions.map((position) => (
              <label
                key={position}
                className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  value={position}
                  className="h-4 w-4 accent-brand-600"
                  {...form.register("secondary_positions")}
                />
                {formatEnum(position)}
              </label>
            ))}
          </div>
          {errors.secondary_positions?.message && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.secondary_positions.message}
            </p>
          )}
        </fieldset>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">Program and measurements</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Graduation year"
            htmlFor="graduation_year"
            error={errors.graduation_year?.message}
          >
            <Input
              id="graduation_year"
              type="number"
              min="2020"
              max="2045"
              {...form.register("graduation_year")}
            />
          </FormField>
          <FormField
            label="School"
            htmlFor="school_name"
            error={errors.school_name?.message}
          >
            <Input id="school_name" {...form.register("school_name")} />
          </FormField>
          <FormField
            label="Team"
            htmlFor="team_name"
            error={errors.team_name?.message}
          >
            <Input id="team_name" {...form.register("team_name")} />
          </FormField>
          <FormField
            label="Height (inches)"
            htmlFor="height_inches"
            error={errors.height_inches?.message}
          >
            <Input
              id="height_inches"
              type="number"
              min="1"
              max="100"
              {...form.register("height_inches")}
            />
          </FormField>
          <FormField
            label="Weight (pounds)"
            htmlFor="weight_pounds"
            error={errors.weight_pounds?.message}
          >
            <Input
              id="weight_pounds"
              type="number"
              min="1"
              max="500"
              {...form.register("weight_pounds")}
            />
          </FormField>
        </div>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">Coaching notes</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <FormField
            label="General notes"
            htmlFor="general_notes"
            error={errors.general_notes?.message}
          >
            <Textarea id="general_notes" {...form.register("general_notes")} />
          </FormField>
          <FormField
            label="Injury notes"
            htmlFor="injury_notes"
            hint="Sensitive information. Access is limited to authorized coaches."
            error={errors.injury_notes?.message}
          >
            <Textarea
              id="injury_notes"
              className="border-amber-300 bg-amber-50/30"
              {...form.register("injury_notes")}
            />
          </FormField>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" icon={Save} isLoading={isPending}>
          {athlete ? "Save changes" : "Create athlete"}
        </Button>
      </div>
    </form>
  );
}
