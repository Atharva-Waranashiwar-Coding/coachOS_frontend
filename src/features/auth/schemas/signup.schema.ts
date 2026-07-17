import { z } from "zod";

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer"),
    passwordConfirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
