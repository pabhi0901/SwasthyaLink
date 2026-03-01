import mongoose from "mongoose";
import {nanoid} from "nanoid";
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },

    description: {
      type: String
    },

    category: {
      type: String,
      enum: [
        "nursing",
        "elder-care",
        "post-surgery-care",
        "physiotherapy",
        "diagnostic",
        "home-visit-doctor",
        "vaccination",
        "palliative-care",
        "medical-equipment-rental",
        "icu-at-home",
        "mother-and-baby-care",
        "massage-therapy"
      ],
      required: true,
      default: "nursing"
    },

    sessionDuration: {
      type: Number // in minutes
    },

    price: {
      type: Number,
      required: true
    },

    images: [
    {
    url: String,
    isPrimary: Boolean,
    }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    },

    averageRating: {
      type: Number,
      default: 0
    },

    totalBookings: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexing (important for performance)
serviceSchema.index({ name: "text", description: "text", category: "text" });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ category: 1, price: 1, isActive: 1 });

export default mongoose.model("Service", serviceSchema);