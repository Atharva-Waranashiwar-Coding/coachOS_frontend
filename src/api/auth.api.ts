import { authClient } from "./api-client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  SignupCredentials,
} from "../features/auth/types";

export async function signup(
  credentials: SignupCredentials,
): Promise<AuthUser> {
  const { data } = await authClient.post<AuthUser>("/auth/signup", credentials);
  return data;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await authClient.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await authClient.get<AuthUser>("/auth/me");
  return data;
}

export async function acceptInvitation(payload: {
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await authClient.post("/auth/invitations/accept", payload);
}
