import { Router, Request, Response } from "express";
import { userProvider } from "@/providers/user-provider.js";
import { authMiddleware } from "@/middleware/auth.js";
import { auditLogProvider } from "@/providers/audit-log-provider.js";

const router = Router();

/**
 * GET /api/users/export
 *
 * Export all user data (GDPR Article 20 - Right to Data Portability)
 *
 * Returns: JSON file with all user data including notes, files, and metadata
 */
router.get("/export", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const exportData = await userProvider.exportUserData(userId);

    // Log data export (CRITICAL for GDPR compliance)
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await auditLogProvider.log({
      userId,
      action: "export_user_data",
      resourceType: "user",
      resourceId: userId.toString(),
      ipAddress,
      userAgent,
      metadata: {
        notesCount: exportData.notes.length,
        filesCount: exportData.files.length,
        exportedAt: new Date().toISOString(),
      },
    });

    // Return JSON data for frontend to handle download
    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({
      error: "Export Error",
      message: error instanceof Error ? error.message : "Failed to export user data",
    });
  }
});

/**
 * DELETE /api/users/account
 *
 * Delete user account and all associated data (GDPR Article 17 - Right to Erasure)
 *
 * Body: { password: string }
 *
 * Returns: Success message
 */
router.delete("/account", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        error: "Validation Error",
        message: "Password is required for account deletion",
      });
      return;
    }

    // Get user info before deletion for audit log metadata
    const user = await userProvider.getUserById(userId);

    // Extract IP address and user agent
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Attempt deletion first - will throw if password is invalid
    await userProvider.deleteUserAccount(userId, password);

    // Log account deletion AFTER successful deletion (CRITICAL for GDPR compliance)
    await auditLogProvider.log({
      userId,
      action: "delete_user_account",
      resourceType: "user",
      resourceId: userId.toString(),
      ipAddress,
      userAgent,
      metadata: {
        email: user.email,
        name: user.name,
        deletedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({
      message: "Account successfully deleted. All your data has been permanently removed.",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);

    if (error instanceof Error && error.message === "Invalid password") {
      res.status(401).json({
        error: "Authentication Error",
        message: "Invalid password",
      });
      return;
    }

    res.status(500).json({
      error: "Deletion Error",
      message: error instanceof Error ? error.message : "Failed to delete account",
    });
  }
});

/**
 * GET /api/users/me
 *
 * Get current user information
 *
 * Returns: User object without sensitive data
 */
router.get("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await userProvider.getUserById(userId);

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: "Server Error",
      message: error instanceof Error ? error.message : "Failed to fetch user data",
    });
  }
});

export default router;
