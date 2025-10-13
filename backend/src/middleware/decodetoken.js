import jwt from "jsonwebtoken";
import userSchema from "../models/userSchema.js";
import dbconnect from "../config/dbConnection.js";

export const decodeToken = async (req, res, next) => {
  try {

    await dbconnect();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided",
      });
    }


    let accessToken;
    if (authHeader.includes("Bearer")) {
      accessToken = authHeader.split(" ")[1];
    } else {
      accessToken = authHeader;
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }


    try {
      const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
      const { user_id } = decoded;

      // Check if user exists
      const user = await userSchema.findById(user_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user ID to request
      req.userId = user_id;
      
      // Continue to next middleware/controller
      next();

    } catch (jwtError) {
      // Handle JWT-specific errors
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired, please refresh and generate new token",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      throw jwtError;
    }

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};