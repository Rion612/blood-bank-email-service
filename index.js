const express = require("express");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/send-email", (req, res) => {
  const { email, subject, html } = req.body;
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: subject,
    html: html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
