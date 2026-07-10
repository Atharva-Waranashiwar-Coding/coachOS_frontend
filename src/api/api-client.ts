import axios, { AxiosError } from "axios";

import { env } from "../lib/env";
import { tokenStorage } from "../lib/storage";
import type { ApiError, FieldError } from "../types/api";

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

function withAuthentication(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { Accept: "application/json" },
  });
  client.interceptors.request.use((config) => {
    const token = tokenStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && tokenStorage.get())
        unauthorizedHandler?.();
      return Promise.reject(error);
    },
  );
  return client;
}

export const authClient = withAuthentication(env.authApiUrl);
export const athleteClient = withAuthentication(env.athleteApiUrl);
export const aiReviewClient = withAuthentication(env.aiReviewApiUrl);

interface ValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
}

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error))
    return {
      status: null,
      message: "Something went wrong. Please try again.",
      fieldErrors: [],
    };
  if (!error.response)
    return {
      status: null,
      message: "Unable to reach CoachOS. Check your connection and try again.",
      fieldErrors: [],
    };

  const status = error.response.status;
  const data = error.response.data as
    | {
        detail?: string | ValidationIssue[];
        error?: { message?: string; details?: unknown };
      }
    | undefined;
  const detail = data?.detail;
  const fieldErrors: FieldError[] = Array.isArray(detail)
    ? detail.flatMap((issue) => {
        const field = issue.loc?.filter((part) => part !== "body").join(".");
        return field && issue.msg ? [{ field, message: issue.msg }] : [];
      })
    : [];

  const fallback: Record<number, string> = {
    401: "Your session is invalid or has expired.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This conflicts with an existing record.",
    422: "Review the highlighted fields and try again.",
    500: "CoachOS could not complete the request. Please try again.",
  };
  const message =
    typeof detail === "string"
      ? detail
      : (data?.error?.message ??
        fallback[status] ??
        "The request could not be completed.");
  return { status, message, fieldErrors };
}
