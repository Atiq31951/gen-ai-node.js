import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createChatCompletion } from "./services/chat.service";
import { getContext } from "./utils/contextManager";

const PORT = process.env.PORT || 3002;

const app = express();
app.use(cors());
app.use(express.json());

// REST: load chat history for a room
app.get("/api/chat/rooms/:roomId/messages", (req, res) => {
  const { roomId } = req.params;
  const userId = req.headers["x-user-id"];


  console.log("Ki re asisos");

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const messages = getContext(roomId).filter((m) => m.role !== "system");
  res.json({ messages });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  path: "/api/chat",
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Connection create korsos?");
  const auth = (socket.handshake.auth || {}) as Record<string, any>;
  const query = (socket.handshake.query || {}) as Record<string, any>;

  const roomId = (auth.roomId || query.roomId) as string;
  const userId = (auth.userId || query.userId) as string;
  const userName = (auth.userName || query.userName || "User") as string;

  if (!roomId || !userId) {
    console.warn(`[Connection Rejected] Missing roomId or userId. Auth:`, auth, `Query:`, query);
    socket.disconnect();
    return;
  }

  socket.join(roomId);
  console.log(`User "${userName}" (${userId}) joined room: ${roomId}`);

  // যেকোনো ইনকামিং ইভেন্ট ও মেসেজ লগ করার জন্য
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] Event: "${event}" | Data:`, JSON.stringify(args));
  });

  socket.on("message", async (userMessage: string) => {
    console.log(`[Message Received] From "${userName}" (${userId}) in Room "${roomId}":`, userMessage);
    try {
      const reply = await createChatCompletion(roomId, userMessage, userName);
      console.log(`[AI Reply Generated] Room "${roomId}":`, reply);
      io.to(roomId).emit("reply", { from: "assistant", text: reply });
    } catch (err) {
      console.error("[Chat Error]:", err);
      socket.emit("error", "Something went wrong. Please try again.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User "${userName}" (${userId}) left room: ${roomId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
