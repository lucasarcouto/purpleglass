import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "@/routes/auth.js";
import notesRoutes from "@/routes/notes.js";
import uploadRoutes from "@/routes/upload.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "PurpleGlass backend is running" });
});

app.get("/api/data", (_req: Request, res: Response) => {
  res.json({
    message: "Hello from PurpleGlass!",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Notes routes
app.use("/api/notes", notesRoutes);

// Upload routes
app.use("/api/upload", uploadRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
