import { Router, Request, Response } from "express";
import { authMiddleware } from "@/middleware/auth.js";
import { notesProvider } from "@/providers/notes-provider.js";
import { auditLogProvider } from "@/providers/audit-log-provider.js";

const router = Router();

// Validation helper functions
interface ValidationResult {
  valid: boolean;
  error?: string;
}

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
    let { title, content, tags } = req.body;

    const titleValidation = validateTitle(title);

    if (!titleValidation.valid) {
      res.status(400).json({
        error: "Validation Error",
        message: titleValidation.error,
      });
      return;
    }

    title = titleValidation.coercedValue;

    const contentValidation = validateContent(content);

    if (!contentValidation.valid) {
      res.status(400).json({
        error: "Validation Error",
        message: contentValidation.error,
      });
      return;
    }

    const tagsValidation = validateTags(tags);

    if (!tagsValidation.valid) {
      res.status(400).json({
        error: "Validation Error",
        message: tagsValidation.error,
      });
      return;
    }

    const note = await notesProvider.createNote(userId, title, content, tags);

    // Log note creation
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await auditLogProvider.log({
      userId,
      action: "create_note",
      resourceType: "note",
      resourceId: note.id,
      ipAddress,
      userAgent,
      metadata: {
        title: note.title,
        tags: note.tags,
      },
    });

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
    let { title, content, tags } = req.body;

    // Validate inputs if provided
    if (title !== undefined && title !== null) {
      const titleValidation = validateTitle(title);

      if (!titleValidation.valid) {
        res.status(400).json({
          error: "Validation Error",
          message: titleValidation.error,
        });
        return;
      }

      title = titleValidation.coercedValue;
    }

    const contentValidation = validateContent(content);

    if (!contentValidation.valid) {
      res.status(400).json({
        error: "Validation Error",
        message: contentValidation.error,
      });
      return;
    }

    const tagsValidation = validateTags(tags);

    if (!tagsValidation.valid) {
      res.status(400).json({
        error: "Validation Error",
        message: tagsValidation.error,
      });
      return;
    }

    const note = await notesProvider.updateNote(
      id,
      userId,
      title,
      content,
      tags
    );

    // Log note update
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await auditLogProvider.log({
      userId,
      action: "update_note",
      resourceType: "note",
      resourceId: note.id,
      ipAddress,
      userAgent,
      metadata: {
        title: note.title,
        tags: note.tags,
      },
    });

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

    // Get note details before deletion for audit log
    const note = await notesProvider.getNote(id, userId);

    await notesProvider.deleteNote(id, userId);

    // Log note deletion (CRITICAL for compliance)
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await auditLogProvider.log({
      userId,
      action: "delete_note",
      resourceType: "note",
      resourceId: id,
      ipAddress,
      userAgent,
      metadata: {
        title: note.title,
        tags: note.tags,
        deletedAt: new Date().toISOString(),
      },
    });

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

function validateTitle(
  title: any
): ValidationResult & { coercedValue?: string } {
  if (!title) {
    return { valid: false, error: "Title is required" };
  }

  if (typeof title === "object") {
    return { valid: false, error: "Title must be a string" };
  }

  const coercedTitle = String(title);

  if (coercedTitle.length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (coercedTitle.length > 200) {
    return {
      valid: false,
      error: "Title must be 200 characters or less",
    };
  }

  return { valid: true, coercedValue: coercedTitle };
}

function validateContent(content: any): ValidationResult {
  if (content === undefined || content === null) {
    return { valid: true };
  }

  const contentSize = JSON.stringify(content).length;

  if (contentSize > 1000000) {
    return { valid: false, error: "Content must be less than 1MB" };
  }

  return { valid: true };
}

function validateTags(tags: any): ValidationResult {
  if (tags === undefined || tags === null) {
    return { valid: true };
  }

  if (!Array.isArray(tags)) {
    return { valid: false, error: "Tags must be an array" };
  }

  if (tags.length > 20) {
    return { valid: false, error: "Maximum 20 tags allowed" };
  }

  for (const tag of tags) {
    if (typeof tag !== "string") {
      return { valid: false, error: "All tags must be strings" };
    }

    if (tag.length > 30) {
      return {
        valid: false,
        error: "Each tag must be 30 characters or less",
      };
    }
  }

  return { valid: true };
}

export default router;
