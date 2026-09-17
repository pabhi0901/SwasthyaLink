import mongoose from "mongoose";

const availableServiceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    id: String,
    session_duration: String,
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    flatNumber: String,
    city: String,
    state: String,
    pincode: String,
    locality: String,
  },
  { _id: false }
);

const serviceBookingEssentialsSchema = new mongoose.Schema(
  {
    serviceId: String,

    bookingStage: {
      type: String,
      enum: [
        "confirming_service",
        "booking",
        "booking_success",
        "booking_failed",
        "chat",
      ],
      default: "chat",
    },

    available_services: {
      type: [availableServiceSchema],
      default: [],
    },

    date: String,

    startHour: {
      type: Number,
      min: 0,
      max: 23,
    },

    startMinute: {
      type: Number,
      min: 0,
      max: 59,
    },

    address: addressSchema,
    paymentId: String,
    bookingId: String,
    amount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "expired", null],
      default: null,
    },
    paymentExpiresAt: Date,
  },
  { _id: false }
);

const availableSlotSchema = new mongoose.Schema(
  {
    _id: false,

    startMinute: {
      type: Number,
      required: true,
    },

    endMinute: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const appointmentBookingEssentialsSchema = new mongoose.Schema(
  {
    date: Date,

    startHour: {
      type: Number,
      min: 0,
      max: 23,
    },

    startMinute: {
      type: Number,
      min: 0,
      max: 59,
    },

    appointmentId: String,

    availableSlots: {
      type: [availableSlotSchema],
      default: [],
    },

    selectedSlotId: String,

    paymentId: String,
  },
  { _id: false }
);

const agentStateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    token: {
      type: String,
    },

    chatId: {
      type: String,
      required: true,
      index: true,
    },

    intent: {
      type: String,
      enum: [
        "normal_chat",
        "doctor_appointment_query",
        "service_query",
        "appointment_booking",
        "service_booking",
      ],
      required: false,
    },

    category: {
      type: String,
    },

    user_message: {
      type: String,
      required: true,
    },

    messages_history: {
      type: [String],
      default: [],
    },

    reply_message_to_user: {
      type: String,
    },

    service_booking_essentials:
      serviceBookingEssentialsSchema,

    appointment_booking_essentials:
      appointmentBookingEssentialsSchema,
  },
  {
    timestamps: true,
  }
);

const AgentState = mongoose.model(
  "AgentState",
  agentStateSchema
);

export default AgentState;