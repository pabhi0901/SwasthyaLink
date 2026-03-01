import mongoose from "mongoose";

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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["admin", "nurse", "customer","doctor","pharmacist"],
      default: "customer"
    },

    phone: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    image: { type: String },

    // 🔥 Addresses Array
    addresses: [addressSchema],

    publicId:{
      type:Number,
      required:true,
      unique:true
    },

    category:{
      type:String,
      enum:["general_physician","dentist","cardiologist","dermatologist","gynecologist","pediatrician","psychiatrist","orthopedic","neurologist","other"]
    }

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
