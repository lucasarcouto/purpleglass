import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "@/routes/auth.js";
import notesRoutes from "@/routes/notes.js";
import uploadRoutes from "@/routes/upload.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "PurpleGlass backend is running" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Notes routes
app.use("/api/notes", notesRoutes);

// Upload routes
app.use("/api/upload", uploadRoutes);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server started and listening on http://${HOST}:${PORT}`);
});

export default app;
