import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded from Backend, root, or Render Secret Files
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
if (fs.existsSync("/etc/secrets/.env")) {
  dotenv.config({ path: "/etc/secrets/.env" });
}

let isConnected = false;

// Universal helper to find MongoDB connection string regardless of naming convention
export const getMongoUri = () => {
  // Check exact standard environment variable names
  if (process.env.MONGODB_URI?.trim()) return process.env.MONGODB_URI.trim();
  if (process.env.MONGO_URI?.trim()) return process.env.MONGO_URI.trim();
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  if (process.env.MONGO_URL?.trim()) return process.env.MONGO_URL.trim();
  if (process.env.MONGODB_URL?.trim()) return process.env.MONGODB_URL.trim();

  // Check if Render Secret Files were used (mounted at /etc/secrets/)
  try {
    if (fs.existsSync("/etc/secrets/MONGODB_URI")) {
      const val = fs.readFileSync("/etc/secrets/MONGODB_URI", "utf8").trim();
      if (val) return val;
    }
    if (fs.existsSync("/etc/secrets/MONGO_URI")) {
      const val = fs.readFileSync("/etc/secrets/MONGO_URI", "utf8").trim();
      if (val) return val;
    }
  } catch (e) {
    // ignore read error
  }

  // Case-insensitive and whitespace-tolerant search across all process.env keys
  for (const key of Object.keys(process.env)) {
    const cleanKey = key.trim().toLowerCase();
    const val = process.env[key]?.trim();
    if (
      (cleanKey.includes("mongo") || cleanKey.includes("database")) &&
      val &&
      (val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"))
    ) {
      return val;
    }
  }

  return "mongodb://localhost:27017/crash-game";
};

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  const uri = getMongoUri();
  const maskedUri = uri.replace(/:([^:@]+)@/, ":****@");
  console.log("Connecting to MongoDB URI:", maskedUri);

  if (uri.includes("localhost") && process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ WARNING: Running with localhost MongoDB in production. Please set MONGODB_URI in Render Environment Variables!"
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      dbName: process.env.DB_NAME || "aviator",
    });
    isConnected = true;
    console.log("MongoDB Connected successfully to database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    if (uri.includes("mongodb.net")) {
      console.error(
        "💡 Tip: If using MongoDB Atlas, verify that '0.0.0.0/0' is added to Network Access in your Atlas dashboard."
      );
    }
    throw err;
  }
};
