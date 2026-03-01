import mongoose from "mongoose"

const nurseAvailabilitySchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    startMinutes: {
      type: Number,   // e.g., 540 = 9:00 AM
      required: true
    },

    endMinutes: {
      type: Number,   // e.g., 1080 = 6:00 PM
      required: true
    },

    weeklyOffDays: {
      type: [Number], // 0 = Sunday ... 6 = Saturday
      default: [0]    // Sunday off by default
    }

  },
  { timestamps: true }
)

export default mongoose.model("NurseAvailability", nurseAvailabilitySchema)