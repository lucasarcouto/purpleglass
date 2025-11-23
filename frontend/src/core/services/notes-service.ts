import { apiClient } from "@/core/api/api-client";
import { ApiEndpoint } from "@/core/api/api-endpoint";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/core/notes/types";

interface ApiNote {
  id: string;
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

function mapApiNote(apiNote: ApiNote): Note {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content as Note["content"],
    createdAt: new Date(apiNote.createdAt),
    updatedAt: new Date(apiNote.updatedAt),
  };
}

class NotesService {
  async fetchNotes(): Promise<Note[]> {
    const notes = await apiClient.get<ApiNote[]>(ApiEndpoint.NOTES);
    return notes.map(mapApiNote);
  }

  async fetchNote(id: string): Promise<Note> {
    const note = await apiClient.get<ApiNote>(
      ApiEndpoint.note(id) as unknown as typeof ApiEndpoint.NOTES
    );
    return mapApiNote(note);
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const note = await apiClient.post<ApiNote>(ApiEndpoint.NOTES, input);
    return mapApiNote(note);
  }

  async updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
    const note = await apiClient.patch<ApiNote>(ApiEndpoint.note(id), input);
    return mapApiNote(note);
  }

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(
      ApiEndpoint.note(id) as unknown as typeof ApiEndpoint.NOTES
    );
  }
}

export const notesService = new NotesService();
