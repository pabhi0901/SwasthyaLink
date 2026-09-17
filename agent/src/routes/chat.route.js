import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  updatePaymentSuccess,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create new chat room with first message and Gemini-generated title
router.post("/create", authMiddleware, createChat);

// Get all chat rooms for the logged-in user
router.get("/my-chats", authMiddleware, getUserChats);

// Get message history for a specific chat room
router.get("/:chatId/messages", authMiddleware, getChatMessages);

// Record payment success and persist confirmation AI reply
router.post("/payment-success", authMiddleware, updatePaymentSuccess);

export default router;
