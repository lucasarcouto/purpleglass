import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notesService } from "@/core/services/notes-service";
import { notesEvents } from "@/core/notes/notes-events";

export function EmptyNotesPage() {
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  async function handleCreateNote() {
    setIsCreating(true);
    try {
      const newNote = await notesService.createNote({ title: "Untitled" });
      notesEvents.emit("note-created");
      navigate({ to: "/notes/$noteId", params: { noteId: newNote.id } });
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md px-4">
        <FileTextIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-semibold mb-2">No notes yet</h1>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first note.
        </p>
        <Button onClick={handleCreateNote} disabled={isCreating} size="lg">
          <PlusIcon className="h-4 w-4 mr-2" />
          {isCreating ? "Creating..." : "Create Your First Note"}
        </Button>
      </div>
    </div>
  );
}
