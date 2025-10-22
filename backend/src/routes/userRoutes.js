import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { verifyToken, verifyRefreshToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { signinUser, signupUser } from "../validators/dataValidation.js";
import { generateAccessToken } from "../emailVerify/generateAcesstoken.js";
import { isLoggedIn } from "../middleware/isloggedin.js";
import { upload } from "../config/cloudinaryConfig.js";
import { uploadProfilePic } from "../controllers/userController.js";
import { decodeToken } from "../middleware/decodetoken.js";
import { deleteProfilePic } from "../controllers/userController.js";

const route = express.Router();

route.get("/verify", verifyToken);
route.post("/register", validate(signupUser), registerUser);
route.post("/login", validate(signinUser), loginUser);
route.patch("/logout", isLoggedIn, logoutUser);
route.get('/getAccessToken', verifyRefreshToken, isLoggedIn, generateAccessToken);
route.post("/upload-profile", decodeToken, upload.single("profilePic"), async (req, res) => {
  try {
    await uploadProfilePic(req, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

route.delete("/delete-pic",decodeToken, deleteProfilePic);

export default route;
