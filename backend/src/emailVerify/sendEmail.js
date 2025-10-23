import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS,
  },
  pool: true, 
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, 
  rateLimit: 5,
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

// ✅ Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

const sendemail = async (email, emailToken) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/verify/${emailToken}`;
  
  const mailData = {
    from: `"NoteWorthy App" <${process.env.EMAIL_ID}>`, 
    template: "index",
    to: email,
    subject: "Email Verification - Notes App",
    text: `Please verify your email by clicking the link: ${verificationLink}`,
    context: {
      token: emailToken,
      verificationLink: verificationLink,
    },
    priority: "high", 
    headers: {
      'X-Priority': '1', 
      'Importance': 'high',
    },
  };

  try {
    console.log("Attempting to send verification email...");
    const info = await transporter.sendMail(mailData);
    console.log("✅ Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Verification email failed:", error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendemail;