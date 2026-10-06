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
  const messages = getContext(roomId).filter((m) => m.role !== "system");
  res.json({ messages });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  path: "/api/chat",
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  const auth = (socket.handshake.auth || {}) as Record<string, any>;
  const query = (socket.handshake.query || {}) as Record<string, any>;

  // ডিফল্ট বা ডামি ভ্যালু ফলব্যাক হিসেবে ব্যবহার করা হচ্ছে যাতে অথেনটিকেশন ছাড়া সরাসরি কানেক্ট হতে পারে
  const roomId = (auth.roomId || query.roomId || "default-room") as string;
  const userId = (auth.userId || query.userId || `user-${socket.id.substring(0, 5)}`) as string;
  const userName = (auth.userName || query.userName || `Guest-${socket.id.substring(0, 4)}`) as string;

  socket.join(roomId);
  console.log(`[Socket Connected] User: "${userName}" (${userId}) | Room: "${roomId}" | SocketID: ${socket.id}`);

  // যেকোনো ইনকামিং ইভেন্ট ও মেসেজ লগ করার জন্য
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] Event: "${event}" | Data:`, JSON.stringify(args));
  });

  socket.on("message", async (userMessage: string) => {
    console.log(`[Message Received] From "${userName}" (${userId}) in Room "${roomId}":`, userMessage);
    try {
      const reply = await createChatCompletion(roomId, userMessage, userName);
      console.log(`[AI Reply Generated] Room "${roomId}":`, reply);
      
      const payload = { from: "assistant", text: reply };
      // রুমে ব্রডকাস্ট এবং সেন্ডার সকেটে সরাসরি পাঠানো (নিশ্চিত ডেলিভারির জন্য)
      socket.emit("reply", payload);
      socket.to(roomId).emit("reply", payload);
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
