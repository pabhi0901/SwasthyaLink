import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
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

  },
  { _id: true } // each slot gets Mongo ObjectId
);

const consultationSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    startMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 1440
    },

    endMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 1440
    },

    duration: {
      type: Number,
      required: true,
      min: 1
    },

    buffer: {
      type: Number,
      default: 0,
      min: 0
    },

    // 🔥 Embedded Slots
    slots: [slotSchema],

    category: {
  type: String,
  required: true,
  enum: [
    "general_physician",
    "pediatrics",
    "gynecology",
    "dermatology",
    "orthopedics",
    "cardiology",
    "neurology",
    "psychiatry",
    "ent",
    "ophthalmology",
    "dentistry",
    "pulmonology",
    "endocrinology",
    "gastroenterology",
    "urology"
  ]
},

    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound text index for text search on name, description, and category
consultationSchema.index(
  { name: "text", description: "text", category: "text" }
);

export default mongoose.model("Consultation", consultationSchema);