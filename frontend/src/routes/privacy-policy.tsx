import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/pages-contents/legal/legal-page";

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LegalPage
      title="Privacy Policy"
      markdownPath="/privacy-policy.md"
    />
  );
}
