import { prisma } from "@/core/database/client.js";
import { blobProvider } from "./blob-provider.js";
import { Note } from "@prisma/client";

class NotesProvider {
  /**
   * Lists all notes for a user.
   *
   * @param userId - User ID
   *
   * @returns Array of notes, ordered by most recently updated
   */
  async listNotes(userId: number): Promise<Note[]> {
    return prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Gets a single note by ID.
   *
   * @param noteId - Note ID
   * @param userId - User ID (for authorization)
   *
   * @returns Note if found and belongs to user
   *
   * @throws Error if note not found or doesn't belong to user
   */
  async getNote(noteId: string, userId: number): Promise<Note> {
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  }

  /**
   * Creates a new note.
   *
   * @param userId - User ID
   * @param title - Note title
   * @param content - Note content (JSON)
   *
   * @returns Created note
   *
   * @throws Error if title is missing
   */
  async createNote(
    userId: number,
    title: string,
    content?: any
  ): Promise<Note> {
    if (!title) {
      throw new Error("Title is required");
    }

    return prisma.note.create({
      data: {
        title,
        content: content ?? [],
        userId,
      },
    });
  }

  /**
   * Updates a note.
   *
   * @param noteId - Note ID
   * @param userId - User ID (for authorization)
   * @param title - New title (optional)
   * @param content - New content (optional)
   *
   * @returns Updated note
   *
   * @throws Error if note not found or doesn't belong to user
   */
  async updateNote(
    noteId: string,
    userId: number,
    title?: string,
    content?: any
  ): Promise<Note> {
    // Check note exists and belongs to user
    const existing = await this.getNote(noteId, userId);

    // If content is being updated, clean up removed blob files
    if (content !== undefined) {
      await this.cleanupRemovedBlobs(existing.content, content);
    }

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });
  }

  /**
   * Deletes a note and its associated blob files.
   *
   * @param noteId - Note ID
   * @param userId - User ID (for authorization)
   *
   * @throws Error if note not found or doesn't belong to user
   */
  async deleteNote(noteId: string, userId: number): Promise<void> {
    // Check note exists and belongs to user
    const existing = await this.getNote(noteId, userId);

    // Extract blob URLs from note content
    const blobUrls = blobProvider.extractBlobUrls(existing.content);

    // Delete the note from database
    await prisma.note.delete({
      where: { id: noteId },
    });

    // Clean up associated blob files (ownership already verified via note)
    if (blobUrls.length > 0) {
      try {
        await blobProvider.deleteFilesInternal(blobUrls);
      } catch (error) {
        console.error("Failed to delete blob files:", error);
        // Continue even if blob deletion fails - note is already deleted
      }
    }
  }

  /**
   * Cleans up blob files that were removed during a content update.
   *
   * @param oldContent - Previous content
   * @param newContent - New content
   */
  private async cleanupRemovedBlobs(
    oldContent: any,
    newContent: any
  ): Promise<void> {
    const oldUrls = blobProvider.extractBlobUrls(oldContent);
    const newUrls = blobProvider.extractBlobUrls(newContent);
    const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));

    if (removedUrls.length > 0) {
      try {
        await blobProvider.deleteFilesInternal(removedUrls);
      } catch (error) {
        console.error("Failed to delete removed blob files:", error);
        // Continue even if blob deletion fails - note update will proceed
      }
    }
  }
}

export const notesProvider = new NotesProvider();
