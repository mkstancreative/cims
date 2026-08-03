import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
} from "../api/services/auth";
import { storeTokens, clearTokens } from "../api/services/api";
import { useAuth } from "../context/useAuth";
import { isPaymentRequired } from "../api/types/auth";
import {
  storePendingRegistration,
  clearPendingRegistration,
} from "../helpers/pendingRegistration";
import type {
  LoginPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../api/types/auth";

// ─── Helper: extract API error message ────────────────────────────────────────
function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  return fallback;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export const useLoginUser = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user, pendingRegistration } =
        response.data;

      // The payment-gated branch issues an access token but NO refresh token.
      // storeTokens handles the missing one; the session simply cannot renew.
      storeTokens(accessToken, refreshToken);
      setAuth(user);

      if (isPaymentRequired(response)) {
        storePendingRegistration(pendingRegistration ?? null);
        navigate("/registrations/pending", { replace: true });
        toast.info("Your registration payment is still outstanding.");
        return;
      }

      // ── If the user needs to change their password, a global modal will catch them.
      // We navigate to their respective dashboards normally.

      switch (user.role) {
        case "admin":
        case "coordinator":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "supervisor":
          navigate("/supervisor/dashboard", { replace: true });
          break;
        case "student":
        default:
          navigate("/student/dashboard", { replace: true });
      }

      // Toast fires after navigate — it will render on the new route
      toast.success(`Welcome back, ${user.firstName}! 👋`);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Login failed. Please check your credentials."),
      );
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const useLogoutUser = () => {
  const { clearAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.info("You have been signed out.");
    },
    onError: () => {
      // Still log out locally even if the API call fails
      toast.warning("Session ended — you have been signed out.");
    },
    onSettled: () => {
      clearTokens();
      clearAuth();
      clearPendingRegistration();
      queryClient.clear();
      navigate("/", { replace: true });
    },
  });
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to change password. Please try again."),
      );
    },
  });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    onSuccess: () => {
      toast.success("Reset link sent! Check your email inbox.");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Could not send reset link. Please try again."),
      );
    },
  });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onSuccess: () => {
      toast.success("Password reset successful! You can now sign in.");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          "Password reset failed. The link may have expired.",
        ),
      );
    },
  });
};

