import mongoose from "mongoose";
import { config } from "dotenv";

config();

const DB_URL = process.env.MONGO_URI;
let isConnected = false;

async function dbconnect() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Database connection failed");
  }
}

export default dbconnect;
