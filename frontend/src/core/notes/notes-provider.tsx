import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  NotesContext,
  type NotesContextState,
  type SaveStatus,
} from "@/core/notes/notes-context";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/core/notes/types";
import { notesService } from "@/core/services/notes-service";
import { notesEvents } from "@/core/notes/notes-events";
import { debounce } from "@/utils/debounce";

interface NotesProviderProps {
  children: ReactNode;
  noteId?: string;
}

export function NotesProvider({
  children,
  noteId,
}: Readonly<NotesProviderProps>) {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Debounced API update - waits 500ms after last change
  const debouncedApiUpdate = useRef(
    debounce(async (id: string, input: UpdateNoteInput, eventsToEmit: string[]) => {
      setSaveStatus("saving");

      try {
        await notesService.updateNote(id, input);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);

        // Emit events after successful API update
        eventsToEmit.forEach((event) => {
          notesEvents.emit(event as any);
        });
      } catch (error) {
        console.error("Failed to update note:", error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 500)
  ).current;

  useEffect(() => {
    async function loadNotes() {
      try {
        const fetchedNotes = await notesService.fetchNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, []);

  // Sync selectedNoteId with noteId prop from route
  useEffect(() => {
    if (noteId && noteId !== selectedNoteId) {
      setSelectedNoteId(noteId);
    }
  }, [noteId, selectedNoteId]);

  const createNote = useCallback((input: CreateNoteInput): Note => {
    // Create optimistic note with temporary ID
    const tempId = crypto.randomUUID();
    const now = new Date();
    const optimisticNote: Note = {
      id: tempId,
      title: input.title,
      content: input.content ?? [],
      tags: [],
      createdAt: now,
      updatedAt: now,
    };

    // Optimistically add to state
    setNotes((prev) => [optimisticNote, ...prev]);
    setSelectedNoteId(tempId);

    // Navigate to the optimistic note immediately
    navigate({ to: "/notes/$noteId", params: { noteId: tempId } });

    // Helper to replace temp note with created note
    function replaceWithCreatedNote(notes: Note[], created: Note) {
      return notes.map((n) => (n.id === tempId ? created : n));
    }

    // Helper to remove temp note
    function removeTempNote(notes: Note[]) {
      return notes.filter((n) => n.id !== tempId);
    }

    // Sync with API
    notesService
      .createNote(input)
      .then((createdNote) => {
        setNotes((prev) => replaceWithCreatedNote(prev, createdNote));
        setSelectedNoteId(createdNote.id);
        // Navigate to the actual note ID after creation
        navigate({ to: "/notes/$noteId", params: { noteId: createdNote.id } });
        // Emit event to notify other components
        notesEvents.emit("note-created");
      })
      .catch((error) => {
        console.error("Failed to create note:", error);
        setNotes((prev) => removeTempNote(prev));
        setSelectedNoteId(null);
      });

    return optimisticNote;
  }, [navigate]);

  const updateNote = useCallback(
    (id: string, input: UpdateNoteInput): void => {
      // Helper to update specific note
      function updateNoteById(notes: Note[]) {
        return notes.map((note) => {
          if (note.id !== id) return note;
          return {
            ...note,
            ...input,
            updatedAt: new Date(),
          };
        });
      }

      // Optimistically update UI immediately
      setNotes(updateNoteById);

      // Determine which events to emit after API update
      const eventsToEmit: string[] = [];
      if (input.title !== undefined) {
        eventsToEmit.push("note-title-updated");
      }
      if (input.tags !== undefined) {
        eventsToEmit.push("note-tags-updated");
      }
      if (input.content !== undefined) {
        eventsToEmit.push("note-content-updated");
      }

      // Sync with API (events will be emitted after successful update)
      debouncedApiUpdate(id, input, eventsToEmit);
    },
    [debouncedApiUpdate]
  );

  const deleteNote = useCallback((id: string): void => {
    // Store note for potential rollback
    let deletedNote: Note | undefined;

    // Helper to find and remove note
    function removeNoteById(notes: Note[]) {
      deletedNote = notes.find((n) => n.id === id);
      return notes.filter((n) => n.id !== id);
    }

    // Helper to restore deleted note
    function restoreNote(notes: Note[]) {
      return deletedNote ? [deletedNote, ...notes] : notes;
    }

    // Optimistically remove
    setNotes(removeNoteById);

    // If deleting the current note, navigate to another note or settings
    const wasSelected = selectedNoteId === id;
    setSelectedNoteId((prev) => (prev === id ? null : prev));

    if (wasSelected) {
      // Find another note to navigate to
      const remainingNotes = notes.filter((n) => n.id !== id);
      if (remainingNotes.length > 0) {
        navigate({ to: "/notes/$noteId", params: { noteId: remainingNotes[0].id } });
      } else {
        // No notes left, navigate to root (empty state)
        navigate({ to: "/" });
      }
    }

    // Sync with API
    notesService
      .deleteNote(id)
      .then(() => {
        // Emit event to notify other components
        notesEvents.emit("note-deleted");
      })
      .catch((error) => {
        console.error("Failed to delete note:", error);
        setNotes(restoreNote);
      });
  }, [navigate, notes, selectedNoteId]);

  const selectNote = useCallback((id: string | null): void => {
    if (id) {
      navigate({ to: "/notes/$noteId", params: { noteId: id } });
    }
  }, [navigate]);

  const getSelectedNote = useCallback((): Note | null => {
    if (!selectedNoteId) return null;

    const note = notes.find((n) => n.id === selectedNoteId);

    return note ?? null;
  }, [notes, selectedNoteId]);

  const value: NotesContextState = useMemo(
    () => ({
      notes,
      selectedNoteId,
      isLoading,
      saveStatus,
      createNote,
      updateNote,
      deleteNote,
      selectNote,
      getSelectedNote,
    }),
    [
      notes,
      selectedNoteId,
      isLoading,
      saveStatus,
      createNote,
      updateNote,
      deleteNote,
      selectNote,
      getSelectedNote,
    ]
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}
