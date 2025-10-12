import express from "express";
import { config } from "dotenv";
import route from "./routes/userRoutes.js";
import dbconnect from "./config/dbConnection.js";
import noteRoute from "./routes/noteRoutes.js";
import cors from "cors";
config();

const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.use(express.json());
app.use("/", route);
app.use("/note", noteRoute);
app.use("/uploads", express.static("uploads"));

dbconnect();

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});

export default app;

