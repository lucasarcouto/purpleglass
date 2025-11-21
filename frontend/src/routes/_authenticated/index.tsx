import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages-contents/home-page";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});
