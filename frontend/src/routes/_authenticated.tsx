import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authService } from "@/core/services/auth-service";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (!authService.hasToken()) {
      throw redirect({ to: "/sign-in" });
    }

    // Validate token by fetching current user
    try {
      await authService.getCurrentUser();
    } catch (error) {
      // Token is invalid or expired - clear it and redirect
      console.warn("Authentication failed, redirecting to sign-in:", error);
      await authService.logout();
      throw redirect({ to: "/sign-in" });
    }
  },
  component: Outlet,
});
