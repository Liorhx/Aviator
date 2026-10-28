import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Backend/.env or root ../.env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { setupGameSocket } from "./server/sockets/gameSocket.js";
import authRoutes from "./server/routes/authRoutes.js";
import gameRoutes from "./server/routes/gameRoutes.js";
import adminRoutes from "./server/routes/adminRoutes.js";
import { connectDB } from "./server/config/database.js";

const app = express();
const httpServer = createServer(app);

// Dynamic CORS resolver to seamlessly support Vercel preview domains, production domains, and localhost with credentials
const corsOriginResolver = (origin, callback) => {
  if (!origin) return callback(null, true);

  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== "*") {
    const allowed = process.env.FRONTEND_URL.split(",").map((u) => u.trim());
    if (
      allowed.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }
  }

  // Allow all origins by echoing back the origin (required for credentials: true)
  return callback(null, true);
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginResolver,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: corsOriginResolver,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Database Connection on startup
connectDB().catch((err) => {
  console.warn("Initial DB connection attempt failed:", err.message);
});

// Middleware to ensure DB connection is active for state-altering API requests
app.use(async (req, res, next) => {
  // Allow health check and history without blocking on connection error
  if (req.path === "/api/health" || req.path === "/api/game/history") return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error on request:", err.message);
    res.status(503).json({
      message: "Database connection unavailable. Please verify MONGODB_URI.",
    });
  }
});

// Health check endpoint for Render monitoring & uptime verification
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "";
  const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ":****@") : "using localhost default";

  res.json({
    status: dbState === 1 ? "ok" : "degraded",
    database: states[dbState] || "unknown",
    hasMongoUri: !!(process.env.MONGODB_URI || process.env.MONGO_URI),
    mongoHost: maskedUri,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// Socket Setup
setupGameSocket(io);

// Serve Static Files (Frontend Build when running combined)
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  const indexPath = path.join(publicPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send("Aviator API & Socket Server is running on Render.");
    }
  });
});

// Start listening on Render or local environment
if (process.env.VERCEL !== "1") {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, httpServer, io };
export default app;
