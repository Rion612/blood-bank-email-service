const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());

const IV = crypto.randomBytes(16); // 16 bytes for AES

// Encrypt function
function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    IV
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const ivHex = IV.toString("hex");
  return `${ivHex}:${encrypted}`; // include IV for decryption
}

// Decrypt function
function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/send-email", (req, res) => {
  const { email, subject, text } = req.body;
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(403).send("Forbidden");
  }
  if (decrypt(apiKey) !== "SEND_EMAIL") {
    return res.status(403).send("Forbidden");
  }
  const mailOptions = {
    from: '"Smart Blood Connect" <smart.blood.connect@gmail.com>',
    to: email,
    subject: subject,
    text: text,
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
