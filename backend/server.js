import express from "express";
import env from "dotenv";
import connectMongoDb from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import reportTaskRoutes from "./routes/reportsTask.routes.js";
import toolingRoutes from "./routes/tooling.routes.js";
import responsibleRoutes from "./routes/responsible.routes.js";
import locationRoutes from "./routes/location.routes.js";
import placementRoutes from "./routes/placement.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import messageNotificationRoutes from "./routes/messagenotification.routes.js";
import documentRoutes from "./routes/document.routes.js";
import testRoutes from "./routes/test.routes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/message.modal.js";
import MessageNotification from "./models/messagenotification.modal.js";
import notificationService from "./services/notificationService.js";

// Load environment variables
env.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Use environment variable for frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Allow both transports for better compatibility
  allowEIO3: true, // Allow Engine.IO v3 clients
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Export io instance for use in other modules
export { io };

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "5mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Use environment variable for frontend URL
    credentials: true, // Allow cookies and authorization headers
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messageNotifications", messageNotificationRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reportsTask", reportTaskRoutes);
app.use("/api/tooling", toolingRoutes);
app.use("/api/responsibles", responsibleRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tests", testRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a room based on user ID
  socket.on("joinRoom", (userId) => {
    socket.join(userId); // Join a room named after the user's ID
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (message) => {
    const { senderId, receiverId, text, image } = message;

    try {
      // Save the message to the database
      const newMessage = await Message.create({
        senderId: senderId,
        receiverId: receiverId,
        text,
        image,
      });

      // Create a message notification for receiver
      const newNotif = await MessageNotification.create({
        from: senderId,
        to: receiverId,
        message: text,
      });

      // Emit the message to the sender's room
      socket.to(senderId).emit("receiveMessage", newMessage);

      // Emit the message to the receiver's room
      socket.to(receiverId).emit("receiveMessage", newMessage);

      // Emit a notification event to receiver's room
      socket.to(receiverId).emit("newMessageNotification", newNotif);

      console.log(`Message saved and sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error("Failed to save or send message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectMongoDb(); // Connect to MongoDB
});
