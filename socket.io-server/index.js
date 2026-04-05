dotenv.config();
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
const app = express();
const PORT = 8080;
import http from "http";
import axios from "axios";
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("identity", async (userId) => {
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
      userId,
      socketId: socket.id,
    });
  });

  socket.on("joinRoom", (roomId) => {
    console.log("room for join", roomId);
    socket.join(roomId);
  });

  socket.on("sendMessage", async (message) => {
    console.log("message", message);
    await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save-chat`, message);
    io.to(message.roomId).emit("newMessage", message);
  });

  socket.on("updateLocation", async ({ userId, latitude, longitude }) => {
    try {
      if (!userId || latitude === undefined || longitude === undefined) {
        console.error("❌ Invalid updateLocation payload", {
          userId,
          latitude,
          longitude,
        });
        return;
      }
      const location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
      await axios.post(
        `${process.env.NEXT_BASE_URL}/api/socket/update-location`,
        { userId, location },
      );

      io.emit("updateDeliveryBoyLocation", { userId, location });
    } catch (error) {
      console.error(
        "❌ Location update error:",
        error?.response?.data || error.message,
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnect", socket.id);
  });
});

app.post("/notify", async (req, res) => {
  const { event, data, socketId } = req.body;
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    io.emit(event, data);
  }
  return res.status(200).json({ message: "Notification sent" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
