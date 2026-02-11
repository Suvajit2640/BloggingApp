import express from "express";
import { config } from "dotenv";
import route from "./routes/userRoutes.js";
import noteRoute from "./routes/noteRoutes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dbconnect from "./config/dbConnection.js";
import Message from "./models/messageSchema.js";
import FriendRequest from "./models/friendRequestSchema.js";
import Block from "./models/blockSchema.js";
import { setIo } from "./socket.js";

config();

const PORT = process.env.PORT || 3000;
const app = express();

const corsOptions = {
  origin: [
    "https://blogging-app-f7.vercel.app",
    "http://localhost:5174",
    "http://localhost:3000",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight OPTIONS requests
app.options("*", cors(corsOptions));

app.use("/", route);
app.use("/note", noteRoute);

// --- Realtime chat setup with Socket.IO ---

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

setIo(io);

// Attach authenticated user id to each socket
io.use(async (socket, next) => {
  try {
    const authToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer", "").trim();

    if (!authToken) {
      return next(new Error("No token provided"));
    }

    await dbconnect();

    const decoded = jwt.verify(authToken, process.env.TOKEN_SECRET);

    if (!decoded?.user_id) {
      return next(new Error("Invalid token payload"));
    }

    socket.userId = decoded.user_id;
    return next();
  } catch (err) {
    return next(new Error("Authentication failed"));
  }
});

function getRoomId(userId1, userId2) {
  return [String(userId1), String(userId2)].sort().join(":");
}

io.on("connection", (socket) => {
  const userId = socket.userId;

  // each user has a personal room for realtime events
  socket.join(String(userId));

  // Join a 1-1 conversation room with another user
  socket.on("join_conversation", ({ otherUserId }) => {
    if (!otherUserId) return;
    const roomId = getRoomId(userId, otherUserId);
    socket.join(roomId);
  });

  // Typing indicator between two users
  socket.on("typing", ({ toUserId, isTyping }) => {
    if (!toUserId) return;
    const roomId = getRoomId(userId, toUserId);
    socket.to(roomId).emit("typing_status", {
      fromUserId: userId,
      isTyping: Boolean(isTyping),
    });
  });

  // Load recent message history with another user
  socket.on(
    "load_history",
    async ({ otherUserId, limit = 50, before } = {}) => {
      if (!otherUserId) return;

      await dbconnect();

      const query = {
        $or: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId },
        ],
      };

      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      socket.emit("conversation_history", {
        otherUserId,
        messages: messages.reverse(),
      });
    }
  );

  // Send a message to another user
  socket.on("send_message", async ({ toUserId, text, tempId }) => {
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!toUserId || !trimmed) return;

    await dbconnect();

    // Block check
    const blocked = await Block.findOne({
      $or: [
        { blockerUserId: userId, blockedUserId: toUserId },
        { blockerUserId: toUserId, blockedUserId: userId },
      ],
    });

    if (blocked) {
      socket.emit("chat_error", {
        message: "You cannot chat with this user.",
      });
      return;
    }

    // Only allow chatting between accepted friends
    const friendship = await FriendRequest.findOne({
      status: "accepted",
      $or: [
        { fromUserId: userId, toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
    });

    if (!friendship) {
      socket.emit("chat_error", {
        message: "You can only chat with accepted friends",
      });
      return;
    }

    const roomId = getRoomId(userId, toUserId);

    const messageDoc = await Message.create({
      fromUserId: userId,
      toUserId,
      text: trimmed,
    });

    const payload = {
      _id: messageDoc._id,
      fromUserId: messageDoc.fromUserId,
      toUserId: messageDoc.toUserId,
      text: messageDoc.text,
      createdAt: messageDoc.createdAt,
      tempId,
    };

    io.to(roomId).emit("new_message", payload);
  });
});

// Start HTTP + WebSocket server in non-serverless environments
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server with WebSocket running on port ${PORT}`);
  });
}

export { server, io };
export default app;