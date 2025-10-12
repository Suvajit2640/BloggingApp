import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

const sendemail = async (email, emailToken) => {
  console.log("=== EMAIL DEBUG ===");
  console.log("EMAIL_ID:", process.env.EMAIL_ID);
  console.log("PASS exists:", !!process.env.PASS);
  console.log("Sending to:", email);
  console.log("Token:", emailToken);
  
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.PASS,  // ✅ uppercase PASS
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
    template: "index",
    to: email,
    subject: "Email Verification",
    text: `Verify your email`,
    context: {
      token: emailToken,
    },
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailData);
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

export default sendemail;