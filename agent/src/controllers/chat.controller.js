import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import * as z from "zod";
import Chat from "../models/chat.model.js";
import ChatMessage from "../models/messages.model.js";
import AgentState from "../models/state.model.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0.3,
  apiKey: process.env.GOOGLE_API_KEY,
});

const titleSchema = z.object({
  title: z
    .string()
    .describe("A short, relevant, 3 to 6 word title summarizing the user's message"),
});

const structuredLLM = llm.withStructuredOutput(titleSchema);

export const createChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "First message is required to start a chat",
      });
    }

    const trimmedMessage = message.trim();

    // 1. Generate title using Gemini with SwasthyaLink context
    let title = "New Conversation";
    try {
      const response = await structuredLLM.invoke([
        new SystemMessage(`
You are an AI assistant for SwasthyaLink, an integrated healthcare platform that provides:
1. Online video consultations with verified doctors across multiple specialties (cardiology, dermatology, general physician, pediatrics, gynecology, etc.).
2. Home healthcare services (such as nursing, physiotherapy, elder care, post-surgery care, etc.).

Your task is to generate a concise, meaningful title (strictly 3 to 6 words) for this new chat session based on the user's first message.

RULES:
- Maximum 10-15 words.
- Do NOT use quotation marks or punctuation marks at the end.
- Do NOT prefix with "Title:" or similar words.
- If it's a general greeting (e.g., "hi", "hello"), return "General Consultation".
- Make it relevant to the medical query, symptom, or service requested (e.g., "Cardiology Consultation", "Home Nursing Inquiry", "Knee Pain Consultation").
`),
        new HumanMessage(`User's first message: "${trimmedMessage}"`),
      ]);

      if (response && response.title) {
        title = response.title.replace(/["']/g, "").trim();
      }
    } catch (llmError) {
      console.error("Error generating title with LLM:", llmError.message);
      title =
        trimmedMessage.length > 30
          ? `${trimmedMessage.substring(0, 30)}...`
          : trimmedMessage;
    }

    // 2. Create the Chat document
    const newChat = await Chat.create({
      userId,
      title,
    });


    return res.status(201).json({
      success: true,
      message: "Chat session created successfully",
      chatId: newChat._id,
      title: newChat.title,
      chat: newChat,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create chat session",
      error: error.message,
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or unauthorized",
      });
    }

    const totalMessages = await ChatMessage.countDocuments({ chatId });

    // Fetch latest messages (sorted by createdAt descending, then reverse to chronological)
    const messages = await ChatMessage.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Reverse so frontend gets chronological order
    messages.reverse();

    const currentState = await AgentState.findOne({ chatId, userId });

    return res.status(200).json({
      success: true,
      chatId,
      title: chat.title,
      state: currentState,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages",
      error: error.message,
    });
  }
};

export const updatePaymentSuccess = async (req, res) => {
  try {
    const { chatId, paymentId, bookingId, amount } = req.body;
    const userId = req.user.userId;

    if (!chatId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "chatId and paymentId are required",
      });
    }

    // 1. Update previous message(s) matching this paymentId in this chat to 'success'
    await ChatMessage.updateMany(
      {
        chatId,
        $or: [
          { "paymentDetails.paymentId": paymentId },
          { paymentId: paymentId },
        ],
      },
      {
        $set: {
          paymentStatus: "success",
        },
      }
    );

    // 2. Persist the AI confirmation reply in chat history
    const confirmationText =
      "🎉 Payment verified and booking confirmed successfully! Our healthcare specialist has been scheduled for your home visit.";

    const aiConfirmationMsg = await ChatMessage.create({
      userId,
      chatId,
      role: "ai",
      message: confirmationText,
      paymentDetails: {
        paymentId,
        bookingId: bookingId ? bookingId.toString() : null,
        amount: amount != null ? Number(amount) : null,
      },
      paymentStatus: "success",
    });

    // 3. Update AgentState so bookingStage transitions back to 'chat' (clearing active payment prompt)
    await AgentState.findOneAndUpdate(
      { chatId, userId },
      {
        $set: {
          "service_booking_essentials.bookingStage": "chat",
          "service_booking_essentials.paymentStatus": "success",
          reply_message_to_user: confirmationText,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully and confirmation message saved",
      chatMessage: aiConfirmationMsg,
    });
  } catch (error) {
    console.error("Error updating payment success in chat:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment success",
      error: error.message,
    });
  }
};
