import user from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendemail from "../emailVerify/sendEmail.js";
import { config } from "dotenv";
import sessionSchema from "../models/sessionSchema.js";
import dbconnect from "../config/dbConnection.js";
import { v2 as cloudinary } from "cloudinary";
import otpSchema from "../models/otpSchema.js";
import sendOtpEmail from "../emailVerify/sendOtpEmail.js";
import FriendRequest from "../models/friendRequestSchema.js";
import Block from "../models/blockSchema.js";
import { getIo } from "../socket.js";

config();

const generateToken = (user_id, expire_time) => {
  const cleanExpireTime = String(expire_time).replace(/['"]/g, '').trim();

  const generatedToken = jwt.sign(
    { user_id },
    process.env.TOKEN_SECRET,
    { expiresIn: cleanExpireTime }
  );
  return generatedToken;
};
// register---------------------------------------

export const registerUser = async (req, res) => {
  try {
    await dbconnect();
    console.log("hello")
    // console.log("EXPIRE_TIME:", process.env.EXPIRE_TIME);
    // console.log("EXPIRE_TIME type:", typeof process.env.EXPIRE_TIME);
    // console.log("EXPIRE_TIME length:", process.env.EXPIRE_TIME?.length);
    const { userName, email, password } = req.body;
    const existing_user = await user.findOne({ email });

    if (existing_user) {
      return res.status(400).json({
        success: false,
        message: "User already exists, login to continue",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = await user.create({
      userName,
      email,
      password: hashedPassword,
    });

    const generatedToken = generateToken(data._id, process.env.EXPIRE_TIME);

    await user.updateOne(
      { _id: data._id },
      { $set: { token: generatedToken } }
    );

    try {
      console.log("About to send email...");
      await sendemail(email, generatedToken);
      console.log("Email sending completed");
    } catch (emailError) {
      console.error("Email error caught:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      id: data._id,
      message: "Registered successfully",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// login---------------------------------------

export const loginUser = async (req, res) => {
  try {
    await dbconnect();

    const { email, password } = req.body;

    const existing_user = await user.findOne({ email }).select('+password');

    if (!existing_user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!existing_user.password) {
      console.error("Password field is missing for user:", email);
      return res.status(500).json({
        success: false,
        message: "Account error - please contact support",
      });
    }

    const compare = await bcrypt.compare(password, existing_user.password);

    if (!compare) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (!existing_user.verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const accessToken = generateToken(
      existing_user._id,
      process.env.EXPIRE_TIME
    );
    const refreshToken = generateToken(
      existing_user._id,
      process.env.REFRESH_TOKEN_TIME
    );

    const sessionModel = await sessionSchema.create({
      userId: existing_user._id,
    });

    if (!sessionModel) {
      throw new Error("Session creation failed");
    }

    return res.status(200).json({
      success: true,
      userId: existing_user._id,
      username: existing_user.userName,
      token: accessToken,
      refreshToken: refreshToken,
      profilePic: existing_user.profilePic || "",
      message: "User logged in successfully",
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
// logout-------------------------------------------------

export const logoutUser = async (req, res) => {
  try {
    await dbconnect();

    const { _id } = req.body;
    const existingUser = await user.findById(_id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deleteResult = await sessionSchema.deleteMany({ userId: _id });

    if (deleteResult.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No active sessions found",
      });
    }

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
// upload profile pic
export const uploadProfilePic = async (req, res) => {
  try {
    await dbconnect();

    const existingUser = await user.findById(req.userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    existingUser.profilePic = req.file.path; // Cloudinary URL
    await existingUser.save();

    res.json({ success: true, message: "Profile picture uploaded", url: req.file.path });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete profile pic
export const deleteProfilePic = async (req, res) => {
  try {
    await dbconnect();

    const existingUser = await user.findById(req.userId);

    if (!existingUser || !existingUser.profilePic) {
      return res.status(404).json({ success: false, message: "No profile picture found" });
    }

    const urlParts = existingUser.profilePic.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = `profile_pics/${fileNameWithExtension.split(".")[0]}`;

    await cloudinary.uploader.destroy(publicId);

    existingUser.profilePic = "";
    await existingUser.save();

    res.json({ success: true, message: "Profile picture deleted successfully" });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this to your controller file
export const getProfile = async (req, res) => {
  try {
    await dbconnect();

    const existingUser = await user.findById(req.userId).select('userName email profilePic');

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      userName: existingUser.userName,
      email: existingUser.email,
      profilePic: existingUser.profilePic || ""
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// forget password
export const forgetPassword = async (req, res) => {
  try {
    await dbconnect();
    const { email } = req.body;
    const existing_user = await user.findOne({ email: email });

    if (!existing_user) {
      return res.status(401).json({
        success: false,
        message: "User not registered",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const existingOtp = await otpSchema.findOne({ email });

    if (existingOtp) {
      existingOtp.isVerified = false;
      existingOtp.otp = otp;
      existingOtp.createdAt = Date.now();
      await existingOtp.save();
    } else {
      await otpSchema.create({ email, otp });
    }

    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      console.error("Email sending error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forget password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// otp check
export const otpCheck = async (req, res) => {
  try {
    await dbconnect();
    const { otp, email } = req.body;

    const otpNumber = Number(otp);

    const existing_user = await otpSchema.findOne({ email: email });

    if (!existing_user) {
      return res.status(404).json({
        success: false,
        message: "OTP record not found",
      });
    }

    const otpCreatedAt = existing_user.createdAt;
    const currentTime = new Date();
    const validTime = 5 * 60 * 1000;

    if (currentTime - otpCreatedAt.getTime() > validTime) {
      await otpSchema.deleteOne({ _id: existing_user._id });
      return res.status(401).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (existing_user.otp === otpNumber) {
      existing_user.isVerified = true;
      await existing_user.save();
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid OTP",
    });
  } catch (error) {
    console.error("OTP check error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    await dbconnect(); 
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    
    const otp = await otpSchema.findOne({ email: email });
    
    if (!otp) {
      return res.status(401).json({
        success: false,
        message: "OTP does not exist or has expired",
      });
    }
    
    if (otp.isVerified !== true) {
      return res.status(401).json({
        success: false,
        message: "OTP not verified",
      });
    }
    

    const existing_user = await user.findOne({ email }).select('+password');
    
    if (!existing_user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    

    if (!existing_user.password) {
      console.error("Password field is missing for user:", email);
      return res.status(500).json({
        success: false,
        message: "Account error - please contact support",
      });
    }
    
    const passwordMatch = await bcrypt.compare(password, existing_user.password);
    
    if (passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password",
      });
    }
    

    const hashedPassword = await bcrypt.hash(password, 10);
    existing_user.password = hashedPassword;
    await existing_user.save(); 
    
    await otpSchema.findByIdAndDelete(otp._id);
    
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// --------- Social / Friends ----------

export const getAllUsers = async (req, res) => {
  try {
    await dbconnect();
    const currentUserId = req.userId;

    const users = await user
      .find({ _id: { $ne: currentUserId } })
      .select("userName profilePic");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    await dbconnect();
    const fromUserId = req.userId;
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: "toUserId is required",
      });
    }

    if (String(fromUserId) === String(toUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    const targetUser = await user.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === "accepted"
            ? "You are already friends"
            : "Friend request already pending",
      });
    }

    // Do not allow sending requests when there is a block between users
    const blocked = await Block.findOne({
      $or: [
        { blockerUserId: fromUserId, blockedUserId: toUserId },
        { blockerUserId: toUserId, blockedUserId: fromUserId },
      ],
    });

    if (blocked) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to this user",
      });
    }

    const request = await FriendRequest.create({
      fromUserId,
      toUserId,
    });

    const io = getIo();
    if (io) {
      io.to(String(fromUserId)).to(String(toUserId)).emit("friend_request_updated");
    }

    return res.status(201).json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send friend request",
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    await dbconnect();
    const currentUserId = req.userId;

    const requests = await FriendRequest.find({
      $or: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
    })
      .populate("fromUserId", "userName profilePic")
      .populate("toUserId", "userName profilePic")
      .lean();

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch friend requests",
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    await dbconnect();
    const currentUserId = req.userId;
    const { id } = req.params;

    const request = await FriendRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (String(request.toUserId) !== String(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request is not pending",
      });
    }

    request.status = "accepted";
    await request.save();

    const io = getIo();
    if (io) {
      io
        .to(String(request.fromUserId))
        .to(String(request.toUserId))
        .emit("friend_request_updated");
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to accept friend request",
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    await dbconnect();
    const currentUserId = req.userId;
    const { userId: otherUserId } = req.params;

    await FriendRequest.deleteMany({
      status: "accepted",
      $or: [
        { fromUserId: currentUserId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: currentUserId },
      ],
    });

    const io = getIo();
    if (io) {
      io.to(String(currentUserId)).to(String(otherUserId)).emit("friend_request_updated");
    }

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove friend",
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    await dbconnect();
    const blockerUserId = req.userId;
    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return res.status(400).json({
        success: false,
        message: "blockedUserId is required",
      });
    }

    if (String(blockerUserId) === String(blockedUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    await Block.findOneAndUpdate(
      { blockerUserId, blockedUserId },
      { blockerUserId, blockedUserId },
      { upsert: true, new: true }
    );

    // Remove any friend relationships between these users
    await FriendRequest.deleteMany({
      $or: [
        { fromUserId: blockerUserId, toUserId: blockedUserId },
        { fromUserId: blockedUserId, toUserId: blockerUserId },
      ],
    });

    const io = getIo();
    if (io) {
      io.to(String(blockerUserId)).to(String(blockedUserId)).emit("friend_request_updated");
    }

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to block user",
    });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    await dbconnect();
    const blockerUserId = req.userId;

    const blocks = await Block.find({ blockerUserId })
      .populate("blockedUserId", "userName profilePic")
      .lean();

    return res.status(200).json({
      success: true,
      blocks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blocked users",
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    await dbconnect();
    const blockerUserId = req.userId;
    const { userId: blockedUserId } = req.params;

    await Block.deleteOne({ blockerUserId, blockedUserId });

    const io = getIo();
    if (io) {
      io
        .to(String(blockerUserId))
        .to(String(blockedUserId))
        .emit("friend_request_updated");
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to unblock user",
    });
  }
};
