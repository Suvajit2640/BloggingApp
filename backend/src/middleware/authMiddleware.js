import jwt from "jsonwebtoken";
import userSchema from "../models/userSchema.js";

export const verifyToken = async (req, res) => {
  let token = req.headers["authorization"];
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
  }
  
  token = token.replace("Bearer", "").trim();

  jwt.verify(token, process.env.TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Email verification failed, possibly the link is invalid or expired" 
      });
    } 

    try {

      const updatedUser = await userSchema.findOneAndUpdate(
        { _id: decoded.user_id },
        { $set: { verified: true, token: null } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "Email verified successfully" });
    } catch (updateError) {
      console.error("User update error:", updateError.message);
      return res.status(500).json({ 
        error: "Internal server error", 
        message: "Failed to update user verification" 
      });
    }
  });
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
      return res.status(401).json({ error: "Unauthorized", message: "No refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (error, decoded) => {
      if (error) {
        console.error("Refresh token verification error:", error.message);
        return res.status(401).json({
          error: "Unauthorized",
          message: "Refresh token expired or invalid",
        });
      } 

      try {
        const { user_id } = decoded;
        const user = await userSchema.findById(user_id);

        if (!user) {
          return res.status(404).json({
            error: "User not found",
            message: "User associated with token does not exist"
          });
        }

        req.userId = user_id;
        next();
      } catch (dbError) {
        console.error("Database error in verifyRefreshToken:", dbError.message);
        return res.status(500).json({ 
          error: "Internal server error", 
          message: "Failed to fetch user" 
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error in verifyRefreshToken:", error.message);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message || "An unexpected error occurred" 
    });
  }
};
