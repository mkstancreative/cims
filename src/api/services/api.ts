import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { RefreshTokenResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Token Storage Helpers ─────────────────────────────────────────────────────
export const TOKEN_KEY = "siwes_access_token";
export const REFRESH_KEY = "siwes_refresh_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export function dispatchSessionExpired() {
  clearTokens();
  window.dispatchEvent(new CustomEvent("siwes:session-expired"));
}

// ─── Axios Instance ────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
});

// ─── Request Interceptor — Attach Access Token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — Auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const url = originalRequest.url || "";
    const isLoginOrRefresh =
      url.includes("/auth/login") || url.includes("/auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginOrRefresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        dispatchSessionExpired();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<
          RefreshTokenResponse & { data: { refreshToken?: string } }
        >(`${API_URL}/auth/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken || refreshToken;

        storeTokens(newToken, newRefreshToken);
        processQueue(null, newToken);
        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        dispatchSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Shared Utilities ─────────────────────────────────────────────────────────

/**
 * Extracts a human-readable API error message from an unknown error object.
 * Checks for Axios response payloads, standard Errors, and provides a clean fallback.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
