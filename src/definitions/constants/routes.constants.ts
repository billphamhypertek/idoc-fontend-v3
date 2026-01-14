const PROTECTED_ROUTES = ["/", "/dashboard"];
const PUBLIC_ROUTES = ["/forbidden", "/404"];
const AUTH_ROUTES = ["/login", "/auto-login"];

export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => {
    if (!route.includes(":")) {
      return pathname === route;
    }

    const routePattern = route.replace(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });
};

export const routes = {
  protectedRoutes: PROTECTED_ROUTES,
  publicRoutes: PUBLIC_ROUTES,
  authRoutes: AUTH_ROUTES,
  isProtectedRoute,
};
