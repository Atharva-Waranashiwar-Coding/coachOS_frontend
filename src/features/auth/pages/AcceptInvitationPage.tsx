import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { acceptInvitation } from "../../../api/auth.api";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { FormField, Input } from "../../../components/forms/Fields";

const schema = z
  .object({
    password: z.string().min(12, "Use at least 12 characters."),
    password_confirmation: z.string(),
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

type Values = z.infer<typeof schema>;

export function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", password_confirmation: "" },
  });
  const submit = form.handleSubmit(async (values) => {
    setError("");
    try {
      await acceptInvitation({ token, ...values });
      setComplete(true);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    }
  });
  if (!token)
    return (
      <div role="alert">
        <h1 className="text-2xl font-bold">Invitation link is invalid</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ask your coach for a new invitation.
        </p>
      </div>
    );
  if (complete)
    return (
      <div>
        <h1 className="text-2xl font-bold">Account activated</h1>
        <p className="mt-2 text-gray-600">
          Your password is set and you can now sign in.
        </p>
        <Link
          className="mt-6 inline-block text-sm font-semibold text-brand-700"
          to="/login"
        >
          Continue to sign in
        </Link>
      </div>
    );
  return (
    <>
      <h1 className="text-3xl font-bold">Set your password</h1>
      <p className="mt-2 text-gray-600">
        Activate your athlete account with a secure password.
      </p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        {error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <FormField
          label="Password"
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
        </FormField>
        <FormField
          label="Confirm password"
          htmlFor="password_confirmation"
          error={form.formState.errors.password_confirmation?.message}
        >
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            {...form.register("password_confirmation")}
          />
        </FormField>
        <Button
          className="w-full"
          type="submit"
          icon={KeyRound}
          isLoading={form.formState.isSubmitting}
        >
          Activate account
        </Button>
      </form>
    </>
  );
}
