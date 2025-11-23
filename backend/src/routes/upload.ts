import { Router, Request, Response } from "express";
import multer from "multer";
import { authMiddleware } from "@/middleware/auth.js";
import { blobProvider } from "@/providers/blob-provider.js";
import { transcodeToMP4AAC, isAudioFile } from "@/utils/audio-transcoder.js";

const router = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/upload
 *
 * Upload a file to Vercel Blob storage
 *
 * Body: FormData with 'file' field
 *
 * Returns: { url: string }
 */
router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          error: "Validation Error",
          message: "No file provided",
        });
        return;
      }

      let fileBuffer = file.buffer;
      let fileName = file.originalname;

      // Transcode audio files to MP4/AAC for universal browser compatibility
      if (isAudioFile(file.mimetype)) {
        console.log(`Transcoding audio file: ${fileName} (${file.mimetype})`);
        const transcoded = await transcodeToMP4AAC(file.buffer, fileName);
        fileBuffer = transcoded.buffer;
        fileName = transcoded.filename;
        console.log(`Transcoded to: ${fileName}`);
      }

      const url = await blobProvider.uploadFile(userId, fileName, fileBuffer, {
        addRandomSuffix: true,
      });

      res.status(200).json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to upload file",
      });
    }
  }
);

/**
 * DELETE /api/upload
 *
 * Delete a file from Vercel Blob storage
 *
 * Body: { url: string } or { urls: string[] }
 *
 * Returns: { success: true, deleted: number }
 */
router.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { url, urls } = req.body;

    const urlsToDelete: string[] = urls || (url ? [url] : []);

    if (urlsToDelete.length === 0) {
      res.status(400).json({
        error: "Validation Error",
        message: "No URL(s) provided",
      });
      return;
    }

    const deleted = await blobProvider.deleteFiles(userId, urlsToDelete);

    res.status(200).json({ success: true, deleted });
  } catch (error) {
    console.error("Delete error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete file";
    const status = message.includes("permission") || message.includes("not found") ? 403 : 500;

    res.status(status).json({
      error: status === 403 ? "Forbidden" : "Internal Server Error",
      message,
    });
  }
});

export default router;
