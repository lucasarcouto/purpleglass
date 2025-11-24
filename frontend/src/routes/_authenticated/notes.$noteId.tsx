import { createFileRoute } from "@tanstack/react-router";
import { NotesProvider } from "@/core/notes/notes-provider";
import { NotesPage } from "@/pages-contents/notes/notes-page";

export const Route = createFileRoute("/_authenticated/notes/$noteId")({
  component: NoteRoute,
});

function NoteRoute() {
  const { noteId } = Route.useParams();

  return (
    <NotesProvider noteId={noteId}>
      <NotesPage />
    </NotesProvider>
  );
}
