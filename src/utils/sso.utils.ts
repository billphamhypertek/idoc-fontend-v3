import { isV1Path, SSO_CONFIG } from "@/definitions/constants/sso.constants";
import { getToken } from "./authentication.utils";

export const createSSORedirectUrl = (routerPath: string): string => {
  const token = getToken();

  if (!token) {
    return `${SSO_CONFIG.webV1Url}${routerPath}`;
  }

  const normalizedPath = routerPath.startsWith("/")
    ? routerPath
    : `/${routerPath}`;

  const encodedToken = encodeURIComponent(token);
  const encodedRedirect = encodeURIComponent(normalizedPath);

  const ssoUrl = `${SSO_CONFIG.webV1Url}/auto-login?token=${encodedToken}&redirect=${encodedRedirect}`;

  return ssoUrl;
};

export const redirectToV1 = (routerPath: string): void => {
  window.location.href = routerPath;
};

export const shouldRedirectToV1 = (
  routerPath: string | null | undefined
): boolean => {
  const allowRedirect = process.env.NEXT_PUBLIC_ALLOW_REDIRECT === "true";
  if (!allowRedirect) return false;
  if (!routerPath) return false;
  return isV1Path(routerPath);
};
