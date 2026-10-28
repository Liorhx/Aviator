import jwt from "jsonwebtoken";
import { GameEngine } from "../services/gameEngine.js";

const getJwtSecret = () => process.env.JWT_SECRET || "default_secret";

let gameEngine;

export const setupGameSocket = (io) => {
  gameEngine = new GameEngine(io);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join_room", (data) => {
      const { token } = data;
      if (token) {
        jwt.verify(token, getJwtSecret(), (err, user) => {
          if (!err) {
            socket.data.user = user;
            console.log(`User ${user.username} authenticated on socket.`);
          }
        });
      }
      
      // Send initial state
      socket.emit("game_state", {
        status: gameEngine.state,
        multiplier: gameEngine.multiplier,
        countdown: gameEngine.countdown,
        liveBets: gameEngine.bets
      });
    });

    socket.on("place_bet", async (data) => {
      const user = socket.data.user;
      if (!user) return socket.emit("error", { message: "Unauthorized" });

      try {
        const { amount, betIndex } = data;
        const result = await gameEngine.placeBet(user.id, amount, betIndex || 0);
        socket.emit("bet_placed", { amount, newBalance: result.newBalance, betIndex: betIndex || 0 });
        io.emit("player_bet", { username: user.username, amount, betIndex: betIndex || 0 });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("cash_out", async (data) => {
      const user = socket.data.user;
      if (!user) return socket.emit("error", { message: "Unauthorized" });

      try {
        const { betIndex } = data || {};
        const result = await gameEngine.cashout(user.id, betIndex || 0);
        socket.emit("bet_result", { 
          profit: result.profit, 
          newBalance: result.newBalance,
          multiplier: result.multiplier,
          betIndex: betIndex || 0
        });
        io.emit("player_cashout", { 
          username: user.username, 
          multiplier: result.multiplier,
          profit: result.profit,
          amount: result.amount,
          betIndex: betIndex || 0
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export { gameEngine };
