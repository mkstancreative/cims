import { api } from "./api";
import type {
  LoginPayload,
  LoginResponse,
  GoogleLoginPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  GetMeResponse,
} from "../types/auth";

// ─── Auth Service Functions ────────────────────────────────────────────────────

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

/**
 * Signs in with a Google ID token (from Google Identity Services). The server
 * verifies the token and answers exactly like `/auth/login`.
 */
export const googleLogin = async (
  payload: GoogleLoginPayload,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/google", payload);
  return response.data;
};

export const refreshToken = async (
  token: string,
): Promise<{ accessToken: string }> => {
  const response = await api.post("/auth/refresh-token", {
    refreshToken: token,
  });
  return response.data;
};

export const getMe = async (): Promise<GetMeResponse> => {
  const response = await api.get<GetMeResponse>("/auth/me");
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.put("/auth/change-password", {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await api.post("/auth/reset-password-request", payload);
  return response.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await api.put("/auth/reset-password", payload);
  return response.data;
};

