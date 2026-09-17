import { healthcareGraph } from "../graph/graph.js";
import ChatMessage from "../models/messages.model.js";
import AgentState from "../models/state.model.js";

export default function registerAgentChat(io, socket) {
  const user = socket.user;

  // Send initial connection acknowledgement to the user
  socket.emit("agentReady", {
    success: true,
    message: "Connected to Agent successfully",
    user: {
      userId: user.userId,
      name: user.name,
      role: user.role || "user",
    },
  });

  const handleMessage = async (payload) => {
    try {
      // 1. Extract payload fields
      const {
        userMessage,
        chatId,
        bookingStage = "chat",
        serviceId = null,
        date = null,
        startHour = null,
        startMinute = null,
        address = null,
        serviceDetails = null,
      } = payload || {};

      if (!chatId) {
        return socket.emit("agentError", { message: "chatId is required" });
      }

      if (!userMessage || !userMessage.toString().trim()) {
        return socket.emit("agentError", { message: "userMessage is required" });
      }

      const trimmedMessage = userMessage.toString().trim();
      const currentToken = socket.token;
      const currentUserId = user.userId.toString();

      // Normalize bookingStage and details
      let effectiveBookingStage = bookingStage;
      let effectiveServiceId = serviceId || serviceDetails?.serviceId || null;
      let effectiveDate = date || serviceDetails?.date || null;
      let effectiveStartHour = startHour != null ? Number(startHour) : null;
      let effectiveStartMinute = startMinute != null ? Number(startMinute) : null;
      let effectiveAddress = address || null;

      if (serviceDetails?.time && (effectiveStartHour == null || effectiveStartMinute == null)) {
        const timeParts = serviceDetails.time.split(" ");
        if (timeParts.length === 2) {
          const [hStr, mStr] = timeParts[0].split(":");
          let h = parseInt(hStr, 10);
          const m = parseInt(mStr, 10) || 0;
          if (timeParts[1].toUpperCase() === "PM" && h < 12) h += 12;
          if (timeParts[1].toUpperCase() === "AM" && h === 12) h = 0;
          effectiveStartHour = h;
          effectiveStartMinute = m;
        }
      }

      if (!effectiveAddress && serviceDetails?.address) {
        effectiveAddress = typeof serviceDetails.address === "object" ? serviceDetails.address : null;
      }

      // If user provides serviceId & date & address (or explicitly bookingStage === "booking"),
      // promote bookingStage to "booking"
      if (effectiveServiceId && effectiveDate && (effectiveBookingStage === "confirming_service" || effectiveBookingStage === "chat")) {
        effectiveBookingStage = "booking";
      }

      const isBookingAction = effectiveBookingStage === "booking";

      // ==========================================
      // SPECIAL CASE: User cancels service selection
      // ==========================================
      if (effectiveBookingStage === "booking_failed" && trimmedMessage === "No service selected") {
        // Save user's cancellation message
        await ChatMessage.create({
          userId: currentUserId,
          chatId,
          role: "user",
          message: trimmedMessage,
        });

        const cancelReply =
          "No problem! You can still continue exploring on our platform. We are always ready to help you.";

        // Save AI reply in chat history
        await ChatMessage.create({
          userId: currentUserId,
          chatId,
          role: "ai",
          message: cancelReply,
        });

        // Reset state in DB
        await AgentState.findOneAndUpdate(
          { chatId, userId: currentUserId },
          {
            $set: {
              intent: "normal_chat",
              user_message: trimmedMessage,
              reply_message_to_user: cancelReply,
              "service_booking_essentials.bookingStage": "chat",
            },
          },
          { upsert: true }
        );

        // Emit standard response to frontend
        return socket.emit("agentMessage", {
          chatId,
          message: cancelReply,
          bookingStage: "chat",
          available_services: [],
          paymentId: null,
        });
      }

      // ==========================================
      // CHECK PREVIOUS MESSAGES IN THIS CHAT
      // ==========================================
      const previousMessages = await ChatMessage.find({ chatId }).sort({
        createdAt: 1,
      });

      let stateToInvoke;

      if (previousMessages.length === 0) {
        // CASE 1: NEW CHAT (No previous messages)
        stateToInvoke = {
          userId: currentUserId,
          token: currentToken,
          chatId,
          ...(isBookingAction ? { intent: "service_booking" } : {}),
          user_message: trimmedMessage,
          messages_history: [],
          service_booking_essentials: {
            bookingStage: effectiveBookingStage || "chat",
            serviceId: effectiveServiceId || undefined,
            date: effectiveDate || undefined,
            startHour: effectiveStartHour != null ? effectiveStartHour : undefined,
            startMinute: effectiveStartMinute != null ? effectiveStartMinute : undefined,
            address: effectiveAddress || undefined,
          },
        };

        // Save incoming user message in DB
        await ChatMessage.create({
          userId: currentUserId,
          chatId,
          role: "user",
          message: trimmedMessage,
        });
      } else {
        // CASE 2: EXISTING CHAT (Previous messages found)
        // Extract last 10 messages before saving the current one
        const last10 = previousMessages.slice(-10);
        const formattedHistory = last10.map((msg) => {
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          return `${msg.role}: ${msg.message}${time ? ` (${time})` : ""}`;
        });

        // Save incoming user message in DB
        await ChatMessage.create({
          userId: currentUserId,
          chatId,
          role: "user",
          message: trimmedMessage,
        });

        // Fetch previous saved state from DB
        const savedStateDoc = await AgentState.findOne({
          chatId,
          userId: currentUserId,
        });
        const rawEssentials =
          savedStateDoc?.service_booking_essentials?.toObject?.() ||
          savedStateDoc?.service_booking_essentials ||
          {};
        const prevEssentials = Object.fromEntries(
          Object.entries(rawEssentials).filter(
            ([_, v]) => v !== null && v !== undefined
          )
        );

        stateToInvoke = {
          userId: currentUserId,
          token: currentToken,
          chatId,
          ...(isBookingAction ? { intent: "service_booking" } : {}),
          user_message: trimmedMessage,
          messages_history: formattedHistory,
          service_booking_essentials: {
            ...prevEssentials,
            bookingStage: effectiveBookingStage,
            ...(effectiveServiceId ? { serviceId: effectiveServiceId } : {}),
            ...(effectiveDate ? { date: effectiveDate } : {}),
            ...(effectiveStartHour != null ? { startHour: effectiveStartHour } : {}),
            ...(effectiveStartMinute != null ? { startMinute: effectiveStartMinute } : {}),
            ...(effectiveAddress ? { address: effectiveAddress } : {}),
          },
        };
      }

      // ==========================================
      // INVOKE LANGGRAPH
      // ==========================================
      const graphResponse = await healthcareGraph.invoke(stateToInvoke);

      const aiReply =
        graphResponse.reply_message_to_user ||
        "I am here to assist you with SwasthyaLink healthcare services.";

      // ==========================================
      // PREPARE & SAVE AI MESSAGE WITH PAYMENT TIMING
      // ==========================================
      const finalBookingStage =
        graphResponse.service_booking_essentials?.bookingStage || "chat";

      const isConfirming =
        graphResponse.intent === "service_booking" &&
        finalBookingStage === "confirming_service";

      const availableServices = isConfirming
        ? graphResponse.service_booking_essentials?.available_services || []
        : [];

      const paymentId =
        finalBookingStage === "booking_success"
          ? graphResponse.service_booking_essentials?.paymentId || null
          : null;

      const bookingId =
        finalBookingStage === "booking_success"
          ? graphResponse.service_booking_essentials?.bookingId || null
          : null;

      const amount =
        finalBookingStage === "booking_success"
          ? graphResponse.service_booking_essentials?.amount || null
          : null;

      const paymentExpiresAt = paymentId
        ? new Date(Date.now() + 10 * 60 * 1000)
        : null;

      const paymentStatus = paymentId ? "pending" : null;

      // Save AI reply message in DB with payment metadata
      const savedChatMessage = await ChatMessage.create({
        userId: currentUserId,
        chatId,
        role: "ai",
        message: aiReply,
        ...(paymentId
          ? {
              paymentDetails: {
                paymentId,
                bookingId,
                amount,
              },
              paymentStatus,
              paymentExpiresAt,
            }
          : {}),
      });

      // Update AgentState in DB
      const updatedEssentials = graphResponse.service_booking_essentials
        ? {
            ...graphResponse.service_booking_essentials,
            ...(paymentId
              ? {
                  paymentExpiresAt,
                  paymentStatus,
                }
              : {}),
          }
        : graphResponse.service_booking_essentials;

      await AgentState.findOneAndUpdate(
        { chatId, userId: currentUserId },
        {
          $set: {
            ...graphResponse,
            service_booking_essentials: updatedEssentials,
            userId: currentUserId,
            token: currentToken,
            chatId,
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      // ==========================================
      // EMIT FRONTEND RESPONSE
      // ==========================================
      const responsePayload = {
        chatId,
        messageId: savedChatMessage._id,
        message: aiReply,
        bookingStage: finalBookingStage,
        available_services: availableServices,
        paymentId,
        bookingId,
        amount,
        paymentStatus,
        paymentExpiresAt: paymentExpiresAt ? paymentExpiresAt.toISOString() : null,
        createdAt: savedChatMessage.createdAt,
      };

      socket.emit("agentMessage", responsePayload);
      socket.emit("messageReceived", {
        status: "success",
        chatId,
      });
    } catch (error) {
      console.error("Error processing agent chat message:", error);
      socket.emit("agentError", {
        message: "An error occurred while processing your message",
        error: error.message,
      });
    }
  };

  // Support common event names for sending messages
  socket.on("userMessage", handleMessage);
  socket.on("agentChatMessage", handleMessage);
  socket.on("message", handleMessage);
}
