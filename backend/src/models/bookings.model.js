import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: true,
      trim: true
    },

    locality: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      required: true,
      trim: true
    },

    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/   // Indian pincode validation
    }
  },
  { _id: true } // Each address gets its own ObjectId
);


const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    startMinutes: {
      type: Number,
      required: true
    },

    endMinutes: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "PAYMENT_PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED"
      ],
      default: "PAYMENT_PENDING"
    },

    totalPrice: {
      type: Number,
      required: true
    },
  
    address: {
  type: addressSchema,
  required: true
  },

  expiresAt: {
  type: Date,
  default: null
  }

  },
  { timestamps: true }
)

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export default mongoose.model("Booking", bookingSchema)