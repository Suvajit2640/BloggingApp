import express from "express";
import { config } from "dotenv";
import route from "./routes/userRoutes.js";

import noteRoute from "./routes/noteRoutes.js";
import cors from "cors";

config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", route);
app.use("/note", noteRoute);


export default app;