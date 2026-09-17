import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    paymentDetails: {
      paymentId: {
        type: String,
        default: null,
        index: true,
      },
      bookingId: {
        type: String,
        default: null,
      },
      amount: {
        type: Number,
        default: null,
      },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "expired", null],
      default: null,
    },

    paymentExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

export default ChatMessage;