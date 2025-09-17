import express from "express";
import FirebaseToken from "../models/FirebaseToken.js";
import { sendPushNotification } from "../utils/firebaseAdmin.js";

const router = express.Router();

// Save Firebase token from frontend
router.post("/register", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const exists = await FirebaseToken.findOne({ token });
    if (!exists) {
      await FirebaseToken.create({ token });
    }
    res.status(201).json({ message: "Token saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save token" });
  }
});
 
// Manual test push
router.post("/send", async (req, res) => {
  const { title, body } = req.body;

  try {
    const tokens = await FirebaseToken.find({});
    const results = await Promise.allSettled(
      tokens.map(t => sendPushNotification(t.token, title || "CRM Alert", body || "This is a test push"))
    );

    res.status(200).json({ message: "Push sent", results });
  } catch (error) {
    res.status(500).json({ error: "Push failed", details: error.message });
  }
});

export default router;
