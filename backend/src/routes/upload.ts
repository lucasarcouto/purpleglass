import { Router, Request, Response } from "express";
import multer from "multer";
import { authMiddleware } from "@/middleware/auth.js";
import { uploadRateLimiter } from "@/middleware/rate-limit.js";
import { blobProvider } from "@/providers/blob-provider.js";
import { transcodeToMP4AAC, isAudioFile } from "@/utils/audio-transcoder.js";
import { auditLogProvider } from "@/providers/audit-log-provider.js";

const router = Router();

// Whitelist of allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  // Audio
  "audio/mpeg", // MP3
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4", // M4A
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  // Video
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // MOV
  // Documents
  "application/pdf",
];

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Store rejected file info for audit logging
      (req as any).rejectedFile = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };

      cb(
        new Error(
          `File type '${file.mimetype}' is not allowed. Allowed types: images, audio, video, and PDF.`
        )
      );
      return;
    }
    cb(null, true);
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
  uploadRateLimiter,
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

      // Log file upload (CRITICAL for compliance)
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      await auditLogProvider.log({
        userId,
        action: "upload_file",
        resourceType: "file",
        resourceId: url,
        ipAddress,
        userAgent,
        metadata: {
          filename: fileName,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });

      res.status(200).json({ url });
    } catch (error) {
      console.error("Upload error:", error);

      // Handle multer file type errors
      if (error instanceof Error && error.message.includes("not allowed")) {
        // Log rejected file upload attempt (security monitoring)
        const userId = req.user?.userId;
        const rejectedFile = (req as any).rejectedFile; // Stored by fileFilter
        const ipAddress =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
          req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];

        if (userId) {
          await auditLogProvider.log({
            userId,
            action: "upload_file",
            resourceType: "file",
            ipAddress,
            userAgent,
            metadata: {
              status: "rejected",
              reason: "unsupported_file_type",
              attemptedMimeType: rejectedFile?.mimetype,
              attemptedFilename: rejectedFile?.originalname,
              attemptedSize: rejectedFile?.size,
            },
          });
        }

        res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
        return;
      }

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

    // Log file deletion (CRITICAL for compliance)
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await auditLogProvider.log({
      userId,
      action: "delete_file",
      resourceType: "file",
      ipAddress,
      userAgent,
      metadata: {
        urls: urlsToDelete,
        deletedCount: deleted,
        deletedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({ success: true, deleted });
  } catch (error) {
    console.error("Delete error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete file";
    const status =
      message.includes("permission") || message.includes("not found")
        ? 403
        : 500;

    res.status(status).json({
      error: status === 403 ? "Forbidden" : "Internal Server Error",
      message,
    });
  }
});

export default router;
