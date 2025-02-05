import express from "express";
import env from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";

env.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json()); //parsing request body
app.use(express.urlencoded({ extended: true })); //parsing form data encoded

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectMongoDb();
});
