import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
      index: true
    },

    // IMPORTANT: This defines the slot uniquely
    date: {
      type: Date,
      required: true,
      index: true
    },

    startMinute: {
      type: Number,
      required: true,
      min: 0,
      max: 1440
    },

    endMinute: {
      type: Number,
      required: true,
      min: 0,
      max: 1440
    },

    // Snapshot of consultation price at booking time
    price: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "NO_SHOW"
      ],
      default: "PENDING_PAYMENT",
      index: true
    },

    expiresAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

appointmentSchema.index(
  { consultationId: 1, date: 1, startMinute: 1 },
  { unique: true }
);

appointmentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Appointment", appointmentSchema);