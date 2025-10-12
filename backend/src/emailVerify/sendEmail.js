import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

const sendemail = async (email, emailToken) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.pass,
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

  transporter.sendMail(mailData, (error) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Email Sent succesfully");
    }
  });
};

export default sendemail;
