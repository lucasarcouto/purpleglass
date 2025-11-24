import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "@/routes/auth.js";
import notesRoutes from "@/routes/notes.js";
import uploadRoutes from "@/routes/upload.js";
import usersRoutes from "@/routes/users.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP is disabled for JSON API backend - it's only needed for serving HTML pages
    crossOriginEmbedderPolicy: false, // Needed for CORS
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Needed for CORS
  })
);

// CORS Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// JSON Payload Middleware with size limit
app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "PurpleGlass backend is running" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", usersRoutes);

// Notes routes
app.use("/api/notes", notesRoutes);

// Upload routes
app.use("/api/upload", uploadRoutes);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server started and listening on http://${HOST}:${PORT}`);
});

export default app;
