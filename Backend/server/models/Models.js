import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 1000.0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);

const RoundSchema = new mongoose.Schema(
  {
    crashPoint: { type: Number, required: true },
    seed: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  },
  { timestamps: true }
);

// TTL index: Automatically deletes rounds older than 24 hours (86400 seconds)
// Ensures MongoDB Atlas free tier storage never runs out
RoundSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Round = mongoose.model("Round", RoundSchema);

const BetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roundId: { type: mongoose.Schema.Types.ObjectId, ref: "Round", required: true },
    amount: { type: Number, required: true },
    betIndex: { type: Number, default: 0 },
    cashoutMultiplier: { type: Number },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL index: Automatically deletes bets older than 48 hours (172800 seconds)
BetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

export const Bet = mongoose.model("Bet", BetSchema);
