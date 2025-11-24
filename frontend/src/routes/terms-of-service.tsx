import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/pages-contents/legal/legal-page";

export const Route = createFileRoute("/terms-of-service")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LegalPage
      title="Terms of Service"
      markdownPath="/terms-of-service.md"
    />
  );
}
