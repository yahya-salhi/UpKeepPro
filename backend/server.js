import express from "express";
import env from "dotenv";
import connectMongoDb from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import cors from "cors";

env.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json({ limit: "5mb" })); //parsing request body
app.use(express.urlencoded({ extended: true })); //parsing form data encoded
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
//message routes
app.use("/api/message", messageRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectMongoDb();
});
