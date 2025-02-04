import express from "express";
import env from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";

env.config();
const app = express();
const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectMongoDb();
});
