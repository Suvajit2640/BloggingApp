import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

const sendemail = async (email, emailToken) => {
  // console.log("=== EMAIL DEBUG ===");
  // console.log("Sending to:", email);
  // console.log("Token length:", emailToken?.length);
  
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
  
  // Use your frontend URL
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${emailToken}`;
  
  const mailData = {
    from: process.env.EMAIL_ID,
    template: "index",
    to: email,
    subject: "Email Verification - Notes App",
    text: `Please verify your email by clicking the link: ${verificationLink}`,
    context: {
      token: emailToken,
      verificationLink: verificationLink,
    },
  };

  try {
    console.log("Attempting to send email...");
    console.log("Verification link:", verificationLink);
    const info = await transporter.sendMail(mailData);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    console.error("Full error:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendemail;