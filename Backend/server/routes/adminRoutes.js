import { Router } from "express";
import { Round, Bet, User } from "../models/Models.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticateToken);
router.use(isAdmin);

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRounds = await Round.countDocuments();
    const totalBets = await Bet.countDocuments();
    
    const volumeResult = await Bet.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = volumeResult[0]?.total || 0;
    
    res.json({
      totalUsers,
      totalRounds,
      totalBets,
      totalVolume
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.patch("/users/:id/balance", async (req, res) => {
  try {
    const { balance } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { balance }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update balance" });
  }
});

router.get("/rounds", async (req, res) => {
  try {
    const rounds = await Round.find().sort({ createdAt: -1 }).limit(50);
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rounds" });
  }
});

export default router;
