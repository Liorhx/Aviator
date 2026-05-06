import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { setupGameSocket } from "./server/sockets/gameSocket.js";
import authRoutes from "./server/routes/authRoutes.js";
import gameRoutes from "./server/routes/gameRoutes.js";
import adminRoutes from "./server/routes/adminRoutes.js";
import { connectDB } from "./server/config/database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Database Connection
  await connectDB();

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/game", gameRoutes);
  app.use("/api/admin", adminRoutes);

  // Socket Setup
  setupGameSocket(io);

  // Serve Static Files (Frontend Build)
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  app.get("*", (req, res) => {
    // Check if it's an API request first (avoid catching API routes with index.html)
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(publicPath, "index.html"));
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
