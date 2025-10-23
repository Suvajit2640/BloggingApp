import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.PASS,  
    },
  });
  
  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        partialsDir: path.resolve("src/views/partials"),
        defaultLayout: false,
      },
      viewPath: path.resolve("src/views/layouts"),
    })
  );
  
  const mailData = {
    from: process.env.EMAIL_ID,
    template: "forgetPassword", 
    to: email,
    subject: "Password Reset OTP - Notes App",
    text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
    context: {
      otp: otp,
    },
  };

  try {
    console.log("Attempting to send OTP email...");
    const info = await transporter.sendMail(mailData);
    console.log("✅ OTP email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ OTP email sending failed:", error.message);
    throw new Error(`OTP email sending failed: ${error.message}`);
  }
};

export default sendOtpEmail;