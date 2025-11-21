import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authService } from "@/core/services/auth-service";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (!authService.hasToken()) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: Outlet,
});
