export interface SSOConfig {
  currentWebUrl: string;
  webV1Url: string;
  webV2Paths: string[];
}

const getCurrentWebUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

export const SSO_CONFIG: SSOConfig = {
  currentWebUrl: getCurrentWebUrl(),
  webV1Url: process.env.NEXT_PUBLIC_WEB_V1_URL || "",
  webV2Paths: [
    "request/[id]/register",
    "request/[id]/main",
    "request/[id]/slots",
    "request/[id]/search",
  ],
};

const isNumeric = (str: string): boolean => {
  return /^\d+$/.test(str);
};

const isPathMatchPattern = (
  routerPath: string,
  basePath: string,
  subPath: string
): boolean => {
  const normalizedPath = routerPath.startsWith("/")
    ? routerPath
    : `/${routerPath}`;

  const segments = normalizedPath.split("/").filter((seg) => seg.length > 0);

  if (segments.length < 3) return false;

  if (segments[0] !== basePath) return false;

  if (!isNumeric(segments[1])) return false;

  if (segments[2] !== subPath) return false;

  return true;
};

export const isV1Path = (routerPath: string | null | undefined): boolean => {
  if (!routerPath) return false;

  for (const pattern of SSO_CONFIG.webV2Paths) {
    if (!pattern || pattern.trim() === "") continue;

    const patternSegments = pattern.split("/").filter((seg) => seg.length > 0);

    if (patternSegments.length !== 3) continue;

    const basePath = patternSegments[0];
    const paramSegment = patternSegments[1];
    const subPath = patternSegments[2];

    if (paramSegment.startsWith("[") && paramSegment.endsWith("]")) {
      if (!isPathMatchPattern(routerPath, basePath, subPath)) {
        //pattern is V2 path
        return true;
      }
    }
  }

  return false;
};
