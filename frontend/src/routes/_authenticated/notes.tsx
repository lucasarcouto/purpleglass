import { createFileRoute } from "@tanstack/react-router";
import { NotesProvider } from "@/core/notes/notes-provider";
import { NotesPage } from "@/pages-contents/notes/notes-page";

export const Route = createFileRoute("/_authenticated/notes")({
  component: NotesRoute,
});

function NotesRoute() {
  return (
    <NotesProvider>
      <NotesPage />
    </NotesProvider>
  );
}
