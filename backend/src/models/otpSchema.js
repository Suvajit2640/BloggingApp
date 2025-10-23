import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
   email:{
        type:String,
        required:true
   },
    otp: {
        type: Number,
        required: true,
    },
    isVerified: {
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("otpSchema", otpSchema);