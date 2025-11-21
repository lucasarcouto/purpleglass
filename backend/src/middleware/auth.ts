import { Request, Response, NextFunction } from "express";
import { authProvider } from "@/providers/auth-provider.js";
import { TokenPayload } from "@/types.js";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns 401 if token is missing or invalid, otherwise continues to next middleware
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7);

    const payload = authProvider.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
      return;
    }

    req.user = payload;

    next();
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
}
