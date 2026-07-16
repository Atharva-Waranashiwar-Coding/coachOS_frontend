import { z } from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1),
  VITE_APP_ENV: z.enum(["development", "test", "staging", "production"]),
  VITE_AUTH_API_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
  VITE_ATHLETE_API_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
  VITE_AI_REVIEW_API_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
  VITE_MEDIA_API_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid frontend environment: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
  );
}

export const env = {
  appName: parsed.data.VITE_APP_NAME,
  appEnv: parsed.data.VITE_APP_ENV,
  authApiUrl: parsed.data.VITE_AUTH_API_URL,
  athleteApiUrl: parsed.data.VITE_ATHLETE_API_URL,
  aiReviewApiUrl: parsed.data.VITE_AI_REVIEW_API_URL,
  mediaApiUrl: parsed.data.VITE_MEDIA_API_URL,
  isDevelopment: parsed.data.VITE_APP_ENV === "development",
} as const;
