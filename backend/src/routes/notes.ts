import { Router, Request, Response } from "express";
import { authMiddleware } from "@/middleware/auth.js";
import { notesProvider } from "@/providers/notes-provider.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/notes
 *
 * List all notes for the current user
 *
 * Returns: Note[]
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const notes = await notesProvider.listNotes(userId);

    res.status(200).json(notes);
  } catch {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch notes",
    });
  }
});

/**
 * GET /api/notes/:id
 *
 * Get a single note by ID
 *
 * Returns: Note
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const note = await notesProvider.getNote(id, userId);

    res.status(200).json(note);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch note";
    const status = message === "Note not found" ? 404 : 500;

    res.status(status).json({
      error: status === 404 ? "Not Found" : "Internal Server Error",
      message,
    });
  }
});

/**
 * POST /api/notes
 *
 * Create a new note
 *
 * Body: { title: string, content?: Json, tags?: string[] }
 *
 * Returns: Note
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, content, tags } = req.body;

    const note = await notesProvider.createNote(userId, title, content, tags);

    res.status(201).json(note);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create note";
    const status = message === "Title is required" ? 400 : 500;

    res.status(status).json({
      error: status === 400 ? "Validation Error" : "Internal Server Error",
      message,
    });
  }
});

/**
 * PATCH /api/notes/:id
 *
 * Update a note
 *
 * Body: { title?: string, content?: Json, tags?: string[] }
 *
 * Returns: Note
 */
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const note = await notesProvider.updateNote(id, userId, title, content, tags);

    res.status(200).json(note);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update note";
    const status = message === "Note not found" ? 404 : 500;

    res.status(status).json({
      error: status === 404 ? "Not Found" : "Internal Server Error",
      message,
    });
  }
});

/**
 * DELETE /api/notes/:id
 *
 * Delete a note
 *
 * Returns: { message: string }
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await notesProvider.deleteNote(id, userId);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete note";
    const status = message === "Note not found" ? 404 : 500;

    res.status(status).json({
      error: status === 404 ? "Not Found" : "Internal Server Error",
      message,
    });
  }
});

export default router;
