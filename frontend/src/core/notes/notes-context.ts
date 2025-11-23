import { createContext } from "react";
import type { Note, CreateNoteInput, UpdateNoteInput } from "./types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface NotesContextState {
  notes: Note[];
  selectedNoteId: string | null;
  isLoading: boolean;
  saveStatus: SaveStatus;
  createNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, input: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  getSelectedNote: () => Note | null;
}

export const NotesContext = createContext<NotesContextState | null>(null);
