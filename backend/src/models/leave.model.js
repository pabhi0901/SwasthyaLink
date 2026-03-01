import mongoose from "mongoose"

const leaveSchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    reason: {
      type: String
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }

  },
  { timestamps: true }
)


export default mongoose.model("Leave", leaveSchema)