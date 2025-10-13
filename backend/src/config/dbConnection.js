import mongoose from "mongoose";
import { config } from "dotenv";

config();

const DB_URL = process.env.MONGO_URI;
let isConnected = false; // Track connection status

async function dbconnect() {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("Database connected successfully");
  } catch (e) {
    console.error("Error connecting to the database:", e);
    throw new Error("Database connection failed");
  }
}

export default dbconnect;