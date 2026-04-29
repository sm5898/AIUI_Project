// ─── Profile Routes ───────────────────────────────────────────────────────────
// Protected endpoints — all require a valid JWT via the requireAuth middleware.
// req.userId is injected by requireAuth so controllers know which user to act on.
import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", requireAuth, getProfile);   // GET  current user's profile + stats
router.put("/me", requireAuth, updateProfile); // PUT  update bio, location, photo, name

export default router;
