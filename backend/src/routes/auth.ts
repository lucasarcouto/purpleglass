import { Router, Request, Response } from "express";
import { authProvider } from "@/providers/auth-provider.js";
import { authMiddleware } from "@/middleware/auth.js";
import { prisma } from "@/core/database/client.js";

const router = Router();

/**
 * POST /api/auth/register
 *
 * Create a new user account
 *
 * Body: { email: string, password: string, name: string }
 *
 * Returns: UserData
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        error: "Validation Error",
        message: "Email, password, and name are required",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Validation Error",
        message: "Invalid email format",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: "Validation Error",
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    const result = await authProvider.createUser(email, password, name);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      res.status(409).json({
        error: "Conflict",
        message: "Email already exists",
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create user",
    });
  }
});

/**
 * POST /api/auth/login
 *
 * Authenticate user and return token
 *
 * Body: { email: string, password: string }
 *
 * Returns: { token: string, user: UserData }
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Validation Error",
        message: "Email and password are required",
      });
      return;
    }

    const result = await authProvider.authenticateUser(email, password);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid credentials",
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to authenticate",
    });
  }
});

/**
 * GET /api/auth/me
 *
 * Get current authenticated user's information
 *
 * Protected route - requires valid JWT token
 *
 * Returns: UserData (without password)
 */
router.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // user is guaranteed to not be undefined because of authMiddleware
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          error: "Not Found",
          message: "User not found",
        });
        return;
      }

      res.status(200).json(user);
    } catch {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch user",
      });
    }
  }
);

/**
 * POST /api/auth/logout
 *
 * Logout current user
 *
 * Protected route - requires valid JWT token
 * Note: With JWT, logout is mainly handled client-side by removing the token
 * This endpoint confirms the action server-side
 *
 * Returns: Success message
 */
router.post(
  "/logout",
  authMiddleware,
  async (_: Request, res: Response): Promise<void> => {
    res.status(200).json({
      message: "Logout successful",
    });
  }
);

export default router;
