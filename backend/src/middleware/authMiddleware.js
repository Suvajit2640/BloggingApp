// ============================================
// BACKEND: authMiddleware.js (UPDATED)
// ============================================
import jwt from "jsonwebtoken";
import userSchema from "../models/userSchema.js";

export const verifyToken = async (req, res) => {
  try {
    let token = req.headers["authorization"] || req.query.token || req.params.token;
    
    console.log("=== VERIFY TOKEN DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Authorization header:", req.headers["authorization"]);
    console.log("Token extracted:", token);
    console.log("Request origin:", req.headers.origin);
    
    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized", 
        message: "No token provided" 
      });
    }
    
    // Remove Bearer prefix if present
    token = token.replace("Bearer", "").trim();
    console.log("Token after cleanup:", token.substring(0, 30) + "...");

    // Rest of your existing code...
    jwt.verify(token, process.env.TOKEN_SECRET, async (error, decoded) => {
      // ... your existing verification logic
    });
    
  } catch (error) {
    console.error("Unexpected error in verifyToken:", error.message);
    return res.status(500).json({ 
      success: false,
      error: "Internal server error", 
      message: "An unexpected error occurred during verification" 
    });
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let refreshToken;

    if (authHeader && authHeader.includes("Bearer")) {
      refreshToken = authHeader.split(" ")[1];
    } else {
      refreshToken = authHeader;
    }

    if (!refreshToken) {
      console.log("Refresh token not available");
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized", 
        message: "No refresh token provided" 
      });
    }

    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (error, decoded) => {
      if (error) {
        console.error("Refresh token verification error:", error.message);
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Refresh token expired or invalid",
        });
      } 

      try {
        const { user_id } = decoded;
        const user = await userSchema.findById(user_id);

        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
            message: "User associated with token does not exist"
          });
        }

        req.userId = user_id;
        next();
      } catch (dbError) {
        console.error("Database error in verifyRefreshToken:", dbError.message);
        return res.status(500).json({ 
          success: false,
          error: "Internal server error", 
          message: "Failed to fetch user" 
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error in verifyRefreshToken:", error.message);
    return res.status(500).json({ 
      success: false,
      error: "Internal server error", 
      message: error.message || "An unexpected error occurred" 
    });
  }
};