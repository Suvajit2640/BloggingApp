import user from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendemail from "../emailVerify/sendEmail.js";
import { config } from "dotenv";
import sessionSchema from "../models/sessionSchema.js";
import dbconnect from "../config/dbConnection.js";

config();

const generateToken = (user_id, expire_time) => {
  // Clean the expire_time value
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
    console.log("EXPIRE_TIME:", process.env.EXPIRE_TIME);
    console.log("EXPIRE_TIME type:", typeof process.env.EXPIRE_TIME);
    console.log("EXPIRE_TIME length:", process.env.EXPIRE_TIME?.length);
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

    // ✅ Explicitly select the password field
    const existing_user = await user.findOne({ email }).select('+password');

    if (!existing_user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Check if password exists
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
      username: existing_user.userName,
      token: accessToken,
      refreshToken: refreshToken,
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