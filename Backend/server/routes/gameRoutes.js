import { Router } from "express";
import { Round, Bet } from "../models/Models.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/history", async (req, res) => {
  try {
    const history = await Round.find()
      .select("crashPoint endTime")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

router.get("/my-bets", authenticateToken, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("roundId", "crashPoint");
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bets" });
  }
});

export default router;
