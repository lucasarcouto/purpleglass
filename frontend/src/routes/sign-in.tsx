import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInPage } from "@/pages-contents/auth/sign-in-page";
import { authService } from "@/core/services/auth-service";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    if (authService.hasToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInPage />;
}
