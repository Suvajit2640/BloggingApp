import mongoose from "mongoose";
import { config } from "dotenv";

config(); 

// const DB_URL = process.env.MONGO_URI || process.env.LOCAL_DB;
const DB_URL = process.env.LOCAL_DB;

async function dbconnect() {
  try {

    await mongoose.connect(DB_URL);
    console.log("Database connected successfully");
  } catch (e) {
    console.log("Error connecting to the database", e);
  }
}

export default dbconnect;
