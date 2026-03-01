import mongoose from "mongoose"

const nurseServiceSchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
      required: true
    },

    commissionPercentage: {
      type: Number,
      required: true
    }

  },
  { timestamps: true }
)

// Prevent duplicate nurse-service pair
nurseServiceSchema.index({ nurseId: 1, serviceId: 1 }, { unique: true })



export default mongoose.model("NurseService", nurseServiceSchema)