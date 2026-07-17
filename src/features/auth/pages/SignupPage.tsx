import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../../api/auth.api";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { FormField, Input } from "../../../components/forms/Fields";
import { useAuth } from "../hooks/useAuth";
import { signupSchema, type SignupFormValues } from "../schemas/signup.schema";

export function SignupPage() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      await signup({ email: values.email, password: values.password });
      await login({ email: values.email, password: values.password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      setServerError(
        apiError.status === 409
          ? "An account with this email already exists."
          : apiError.message,
      );
    }
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-ink">Create your coach account</h1>
      <p className="mt-2 text-gray-600">
        Start organizing athletes, goals, and development work in CoachOS.
      </p>
      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        {serverError && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {serverError}
          </div>
        )}
        <FormField
          label="Email"
          htmlFor="signup-email"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="signup-password"
          hint="Use at least 8 characters."
          error={form.formState.errors.password?.message}
        >
          <div className="relative">
            <Input
              id="signup-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              className="pr-11"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-500"
              onClick={() => setShowPasswords((shown) => !shown)}
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>
        <FormField
          label="Confirm password"
          htmlFor="signup-password-confirmation"
          error={form.formState.errors.passwordConfirmation?.message}
        >
          <Input
            id="signup-password-confirmation"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.passwordConfirmation)}
            {...form.register("passwordConfirmation")}
          />
        </FormField>
        <Button
          type="submit"
          icon={UserPlus}
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Create account
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          className="font-semibold text-brand-700 hover:underline"
          to="/login"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-xs leading-5 text-gray-500">
        Signing up creates a coach account. Athlete accounts are activated
        through a coach invitation.
      </p>
    </>
  );
}
