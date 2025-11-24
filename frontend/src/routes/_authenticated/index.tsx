import { createFileRoute, redirect } from "@tanstack/react-router";
import { notesService } from "@/core/services/notes-service";
import { EmptyNotesPage } from "@/pages-contents/notes/empty-notes-page";

export const Route = createFileRoute("/_authenticated/")({
  loader: async () => {
    const notes = await notesService.fetchNotes();

    // If user has notes, redirect to the first one
    if (notes.length > 0) {
      throw redirect({ to: "/notes/$noteId", params: { noteId: notes[0].id } });
    }

    // Otherwise, show empty state
    return { hasNotes: false };
  },
  component: EmptyNotesPage,
});
