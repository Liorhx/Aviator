import { Router } from "express";
import mongoose from "mongoose";
import { Round, Bet } from "../models/Models.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/history", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected yet (readyState:", mongoose.connection.readyState, "), returning empty history.");
      return res.json([]);
    }

    const history = await Round.find()
      .select("crashPoint endTime")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json(history || []);
  } catch (error) {
    console.error("Failed to fetch history:", error.message);
    // Return empty array instead of 500 error so the frontend never crashes
    return res.json([]);
  }
});

router.get("/my-bets", authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const bets = await Bet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("roundId", "crashPoint");

    return res.json(bets || []);
  } catch (error) {
    console.error("Failed to fetch bets:", error.message);
    return res.json([]);
  }
});

export default router;
