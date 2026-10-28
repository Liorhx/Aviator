import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded from Backend or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/crash-game";

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
