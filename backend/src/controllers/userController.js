import user from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendemail from "../emailVerify/sendEmail.js";
import { config } from "dotenv";
import sessionSchema from "../models/sessionSchema.js";
config();

const generateToken = (user_id, expire_time) => {
  const generatedToken = jwt.sign({ user_id }, process.env.TOKEN_SECRET, {
    expiresIn: expire_time,
  });
  return generatedToken;
};

// register---------------------------------------

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = await user.create({
      userName,
      email,
      password: hashedPassword,
    });

    const generatedToken = generateToken(data._id, process.env.EXPIRE_TIME);

    await user.updateOne({
      $where: {
        _id: data._id,
      },
      data: {
        token: generatedToken,
      },
    });

    if (data) {
      sendemail(email, generatedToken);
      res.json({
        status: 201,
        id: data._id,
        message: "registered successfully",
      });
    } else {
      throw new Error("registration failed ");
    }
  } catch (error) {
    res.send({
      status: 404,
      message: "" + error,
    });
  }
};

// login---------------------------------------

export const loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    const existing_user = await user.findOne({ email }, { password: 1 });

    if (!existing_user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: "No user found with the provided email",
      });
    }

    // Compare passwords
    const compare = await bcrypt.compare(
      req.body.password,
      existing_user.password
    );

    if (!compare) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        data: "The password you entered is incorrect",
      });
    } else {
      if (existing_user.verified) {
        // generate tokens
        const accessToken = generateToken(
          existing_user._id,
          process.env.EXPIRE_TIME
        );
        const refreshToken = generateToken(
          existing_user._id,
          process.env.REFRESH_TOKEN_TiME
        );

        const userId = existing_user._id;

        const sessionModel = await sessionSchema.create({
          userId,
        });
        sessionModel.save();

        if (!sessionModel) {
          throw new Error("session creation failed ");
        }
        const nowUser = await user.findOne({ email });
        res.status(201).json({
          username: nowUser.userName,
          token: accessToken,
          refreshToken: refreshToken,
          success: true,
          file:nowUser.file,
          message: "user loggedin successfully.",
        });
      } else {
        res.status(400).json({
          success: false,
          data: "user is not verified",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: "Internal server error",
    });
  }
};

// logout-------------------------------------------------

export const logoutUser = async (req, res) => {
  try {
    const id = req.body._id;
    const existingUser = await user.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: "No user found ",
      });
    } else {
      const deleteSession = sessionSchema
        .deleteMany({ userId: id })
        .then((result) => {
          console.log(result);
          if (deleteSession) {
            return res.json({
              status: 200,
              message: "session deleted and logged out successfully",
            });
          } else {
            res.json({
              status: 404,
              message: "data not found",
            });
          }
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: "Internal server error",
    });
  }
};
