import crypto from "crypto";
import { Round, Bet, User } from "../models/Models.js";

export const GameState = {
  WAITING: "WAITING",
  FLYING: "FLYING",
  CRASHED: "CRASHED",
};

export class GameEngine {
  constructor(io) {
    this.io = io;
    this.state = GameState.WAITING;
    this.multiplier = 1.0;
    this.countdown = 5;
    this.currentRoundId = null;
    this.bets = [];
    this.crashPoint = 1.0;
    this.tickInterval = null;
    this.serverSeed = crypto.randomBytes(32).toString("hex");
    this.startWaiting();
  }

  async startWaiting() {
    this.state = GameState.WAITING;
    this.multiplier = 1.0;
    this.countdown = 5;
    this.bets = [];

    this.io.emit("round_waiting_start", { countdown: this.countdown });

    // Generate next crash point
    const { crashPoint, seed } = this.generateProvablyFairCrash();
    this.crashPoint = crashPoint;

    const round = await Round.create({ crashPoint, seed });
    this.currentRoundId = round._id.toString();

    console.log(`New Round ID: ${this.currentRoundId}, Crash at: ${this.crashPoint}`);

    const interval = setInterval(() => {
      this.countdown -= 1;
      this.io.emit("round_waiting", { countdown: this.countdown });

      if (this.countdown <= 0) {
        clearInterval(interval);
        this.startFlying();
      }
    }, 1000);
  }

  startFlying() {
    this.state = GameState.FLYING;
    this.io.emit("round_started", { roundId: this.currentRoundId });

    let elapsed = 0;
    this.tickInterval = setInterval(() => {
      elapsed += 100;
      // Exponential growth: 1.05 ^ (t in seconds)
      this.multiplier = Math.pow(1.06, elapsed / 1000);
      
      this.io.emit("multiplier_tick", { multiplier: parseFloat(this.multiplier.toFixed(2)) });

      if (this.multiplier >= this.crashPoint) {
        this.crash();
      }
    }, 100);
  }

  async crash() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.state = GameState.CRASHED;

    await Round.findByIdAndUpdate(this.currentRoundId, { endTime: new Date() });

    this.io.emit("round_crashed", { crashAt: parseFloat(this.crashPoint.toFixed(2)) });

    setTimeout(() => {
      this.startWaiting();
    }, 3000);
  }

  generateProvablyFairCrash() {
    const seed = crypto.randomBytes(16).toString("hex");
    const hmac = crypto.createHmac("sha256", this.serverSeed);
    hmac.update(seed);
    const hash = hmac.digest("hex");

    // Logic: use first 8 chars of hash to get a number
    const bigInt = BigInt(`0x${hash.substring(0, 8)}`);
    const val = Number(bigInt % 10000n) / 10000;

    // Crash point calculation
    // House edge: 1%
    // Formula: 0.99 / (1 - X)
    let crashPoint = 0.99 / (1 - val);
    crashPoint = Math.max(1.0, parseFloat(crashPoint.toFixed(2)));

    return { crashPoint, seed };
  }

  async placeBet(userId, amount, betIndex = 0) {
    if (this.state !== GameState.WAITING) {
      throw new Error("Bets only allowed during waiting phase");
    }

    const user = await User.findById(userId);
    if (!user || user.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct balance
    user.balance -= amount;
    await user.save();

    const bet = await Bet.create({
      userId,
      roundId: this.currentRoundId,
      amount,
      betIndex,
    });

    this.bets.unshift({ userId, username: user.username, amount, isCashout: false, betIndex });

    return { bet, newBalance: user.balance };
  }

  async cashout(userId, betIndex = 0) {
    if (this.state !== GameState.FLYING) {
      throw new Error("You can only cash out while flying");
    }

    const bet = await Bet.findOne({
      userId, 
      roundId: this.currentRoundId,
      betIndex,
      cashoutMultiplier: { $exists: false }
    });

    if (!bet) throw new Error("No active bet found");

    const profit = bet.amount * this.multiplier;
    bet.cashoutMultiplier = this.multiplier;
    bet.profit = profit;
    await bet.save();

    // Update in-memory bet record
    const memoryBet = this.bets.find(b => b.userId === userId && (b.betIndex || 0) === betIndex);
    if (memoryBet) {
      memoryBet.isCashout = true;
      memoryBet.multiplier = this.multiplier;
      memoryBet.profit = profit;
    }

    const user = await User.findById(userId);
    if (user) {
      user.balance += profit;
      await user.save();
      return { profit, newBalance: user.balance, multiplier: this.multiplier, amount: bet.amount };
    }
    throw new Error("User not found");
  }
}
