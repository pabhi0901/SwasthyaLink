import mongoose from "mongoose"

const timeSlotSchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
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

    isBooked: {
      type: String,
      enum: ['pending', 'booked', 'rejected'],
      default: 'pending'
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    },

    //TTL FIELD
    expiresAt: {
      type: Date,
      default: null
    }

  },
  { timestamps: true }
)

// Prevent duplicate slot creation
timeSlotSchema.index(
  { nurseId: 1, date: 1, startMinutes: 1, endMinutes: 1 },
  { unique: true }
)

// TTL INDEX
timeSlotSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

export default mongoose.model("TimeSlot", timeSlotSchema)