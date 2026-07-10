import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { FormField, Input } from "../../../components/forms/Fields";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const submit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(
        normalizeApiError(error).status === 401
          ? "Email or password is incorrect."
          : normalizeApiError(error).message,
      );
    }
  });
  return (
    <>
      <h1 className="text-3xl font-bold text-ink">Coach sign in</h1>
      <p className="mt-2 text-gray-600">
        Access your athletes and development plans.
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
          htmlFor="email"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-11"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-500"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>
        <Button
          type="submit"
          icon={LogIn}
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-xs leading-5 text-gray-500">
        Coach access only. Contact your organization administrator if you need
        an account.
      </p>
    </>
  );
}
