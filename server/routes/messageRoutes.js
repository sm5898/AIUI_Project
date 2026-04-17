import express from "express";
import {
  getUserConversations,
  createOrGetConversation,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/:userId", getUserConversations);
router.post("/thread", createOrGetConversation);
router.post("/:conversationId", sendMessage);

export default router;