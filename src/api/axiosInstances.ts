/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios from "axios";
import Cookies from "~/utils/cookies.utils";
import { useEncryptStore } from "@/stores/encrypt.store";

const cancelTokenSource = Axios.CancelToken.source();
const ENCRYPT_EXCEPTION_URL = [
  "/calendar2",
  "/work-schedule",
  "/vehicle-usage-plan",
];

/**
 * Get accessToken from session
 * Be sure token already been set on session
 * @returns String accessToken
 */
export async function getAccessToken() {
  const token = Cookies.get("auth_token");
  if (token) {
    return token;
  }
  return null;
}

/**
 * Protected axios instance
 */
const protectedAxiosInstance = Axios.create({
  timeout: 60 * 1000,
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

/**
 * Request interceptor to add auth token
 */
protectedAxiosInstance.interceptors.request.use(
  async (config) => {
    // 1) Auth header (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 2) Append encrypt=true when global rule says so (Zustand)
    const { isEncrypt } = useEncryptStore.getState(); // define this in your store

    if (isEncrypt) {
      // Build a URL from baseURL + url safely (works with relative or absolute)
      const base = config.baseURL || process.env.NEXT_PUBLIC_API_HOST || "";
      const raw = config.url ?? "";
      let u: URL;
      try {
        u = new URL(raw, base);
      } catch {
        // Fallback: if URL constructor fails, skip mutation
        return config;
      }

      // Skip exceptions by path prefix
      const skip = ENCRYPT_EXCEPTION_URL.some((p) => u.pathname.startsWith(p));
      if (!skip) {
        // Remove any existing encrypt in the URL to keep it idempotent
        u.searchParams.delete("encrypt");

        // Put the cleaned URL back (without encrypt for now)
        const cleanedQuery = u.searchParams.toString();
        config.url =
          u.pathname + (cleanedQuery ? `?${cleanedQuery}` : "") + u.hash;

        // Ensure encrypt goes in Axios params (merges nicely with callers' params)
        if (!config.params) config.params = {};
        // If caller explicitly set encrypt, respect that; otherwise force true
        if (config.params.encrypt === undefined) {
          (config.params as Record<string, unknown>).encrypt = true;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token refresh
 */
protectedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refresh_token");

      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await Axios.post(
            `${process.env.NEXT_PUBLIC_API_HOST}/auth/refresh`,
            { refreshToken },
            {
              timeout: 60 * 1000,
            }
          );

          const {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
          } = response.data;

          // Update tokens in cookies
          Cookies.set("auth_token", accessToken, {
            expires: expiresIn / (24 * 60 * 60),
          });
          Cookies.set("refresh_token", newRefreshToken, { expires: 30 });

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return protectedAxiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            Cookies.remove("auth_token");
            Cookies.remove("refresh_token");
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        if (typeof window !== "undefined") {
          Cookies.remove("auth_token");
          window.location.href = "/login";
        }
      }
    }

    // if (error.response?.status === 403) {
    //   if (typeof window !== "undefined") {
    //     window.location.href = "/forbidden";
    //   }
    // }

    return Promise.reject(error);
  }
);

/**
 * Public axios instance
 */
const publicAxiosInstance = Axios.create({
  timeout: 60 * 1000,
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

/**
 * Public request interceptor
 */
publicAxiosInstance.interceptors.request.use(
  async (config) => config,
  (error) => Promise.reject(error)
);

/**
 * Public response interceptor
 */
publicAxiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    return Promise.reject(error);
  }
);

export { cancelTokenSource, protectedAxiosInstance, publicAxiosInstance };
