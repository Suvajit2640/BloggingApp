import express from "express";
import { config } from "dotenv";
import route from "./routes/userRoutes.js";
import noteRoute from "./routes/noteRoutes.js";
import cors from "cors";

config();

const PORT = process.env.PORT || 3000;
const app = express();

// Updated CORS configuration
const corsOptions = {
  origin: [
    'https://blogging-app-f7.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/", route);
app.use("/note", noteRoute);

export default app;