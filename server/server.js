// ─── Entry point for The Block backend ───────────────────────────────────────
// Loads env vars, configures Express middleware, mounts API route groups,
// connects to MongoDB, then starts the HTTP listener.
import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Route modules — each file handles one resource area
import listingRoutes  from "./routes/listingRoutes.js";
import authRoutes     from "./routes/authRoutes.js";
import profileRoutes  from "./routes/profileRoutes.js";
import savedRoutes    from "./routes/savedRoutes.js";
import messageRoutes  from "./routes/messageRoutes.js";
import aiRoutes       from "./routes/aiRoutes.js";

// ── Startup guard: fail fast if critical env vars are missing ─────────────────
// MONGODB_URI and JWT_SECRET are required — the server cannot function without them.
// GROQ_API_KEY is optional; AI endpoints will fail gracefully if absent.
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[startup] Missing required env vars: ${missing.join(", ")}`);
  console.error("[startup] Create server/.env — see README for required keys.");
  process.exit(1);
}
if (!process.env.GROQ_API_KEY) {
  console.warn("[startup] GROQ_API_KEY is not set — AI features will be unavailable.");
}

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow the Vite dev server (port 5173) to reach the API without CORS errors
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Parse JSON request bodies (required for POST/PUT controllers)
app.use(express.json());

// ── Route mounting ────────────────────────────────────────────────────────────
app.use("/api/listings", listingRoutes);  // Listing CRUD + image upload
app.use("/api/auth",     authRoutes);     // signup / login
app.use("/api/profile",  profileRoutes);  // authenticated profile get/update
app.use("/api/saved",    savedRoutes);    // save / unsave listings
app.use("/api/messages", messageRoutes);  // conversations & messages
app.use("/api/ai",       aiRoutes);       // Groq-powered AI endpoints

// Serve uploaded listing images as static files at /uploads/<filename>
app.use("/uploads", express.static("uploads"));

// Health-check root — confirms the server is reachable
app.get("/", (req, res) => {
  res.send("The Block backend is running");
});

// ── Global error handler ─────────────────────────────────────────────────────
// Catches errors forwarded via next(err) from any controller or middleware
app.use((err, req, res, _next) => {
  console.error("[global error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── Database connection & server start ───────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit so the process manager can restart the service
  });
