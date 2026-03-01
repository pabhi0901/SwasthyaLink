import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["tablet", "capsule", "syrup", "injection", "ointment", "other"],
    required: true
  },

  dosagePerDay: {
    type: Number,
    required: true,
    min: 1
  },

  timing: {
    type: String,
    enum: ["before_food", "after_food", "anytime"],
    default: "after_food"
  },

  durationInDays: {
    type: Number,
    required: true,
    min: 1
  },

  instructions: {
    type: String
  }
}, { _id: false });


const prescriptionSchema = new mongoose.Schema(
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

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true
    },

    medicines: {
      type: [medicineSchema],
      validate: {
        validator: function(val) {
          return val.length > 0;
        },
        message: "At least one medicine must be added"
      }
    },

    diagnosis: {
      type: String,
      required: true
    },

    additionalNotes: {
      type: String
    },

    followUpDate: {
      type: Date
    },

  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);