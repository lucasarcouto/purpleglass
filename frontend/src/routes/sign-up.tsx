import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignUpPage } from "@/pages-contents/auth/sign-up-page";
import { authService } from "@/core/services/auth-service";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    if (authService.hasToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpPage />;
}
