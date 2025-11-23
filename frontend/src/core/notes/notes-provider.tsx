import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import {
  NotesContext,
  type NotesContextState,
  type SaveStatus,
} from "./notes-context";
import type { Note, CreateNoteInput, UpdateNoteInput } from "./types";
import { notesService } from "@/core/services/notes-service";
import { debounce } from "@/utils/debounce";

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: Readonly<NotesProviderProps>) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Debounced API update - waits 500ms after last change
  const debouncedApiUpdate = useRef(
    debounce(async (id: string, input: UpdateNoteInput) => {
      setSaveStatus("saving");

      try {
        await notesService.updateNote(id, input);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
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

  const createNote = useCallback((input: CreateNoteInput): Note => {
    // Create optimistic note with temporary ID
    const tempId = crypto.randomUUID();
    const now = new Date();
    const optimisticNote: Note = {
      id: tempId,
      title: input.title,
      content: input.content ?? [],
      createdAt: now,
      updatedAt: now,
    };

    // Optimistically add to state
    setNotes((prev) => [optimisticNote, ...prev]);
    setSelectedNoteId(tempId);

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
      })
      .catch((error) => {
        console.error("Failed to create note:", error);
        setNotes((prev) => removeTempNote(prev));
        setSelectedNoteId(null);
      });

    return optimisticNote;
  }, []);

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

      // Sync with API
      debouncedApiUpdate(id, input);
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
    setSelectedNoteId((prev) => (prev === id ? null : prev));

    // Sync with API
    notesService.deleteNote(id).catch((error) => {
      console.error("Failed to delete note:", error);
      setNotes(restoreNote);
    });
  }, []);

  const selectNote = useCallback((id: string | null): void => {
    setSelectedNoteId(id);
  }, []);

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
