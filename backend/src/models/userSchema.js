import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  token: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
    select: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  profilePic: { type: String, default: "" }

});

export default mongoose.model("user", userSchema);
