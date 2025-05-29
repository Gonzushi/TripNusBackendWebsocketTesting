// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import necessary modules
import { io, Socket } from "socket.io-client";
import Redis from "ioredis";
import redisConfig from "./config/redisConfig";

// Starting the client
console.log("\n");
const redis = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);
const publisher = new Redis(redisConfig);
const socket: Socket = io(
  // "wss://ws.trip-nus.com",
  "http://localhost:3001",
  { transports: ["websocket"] }
);

// Define the data to be sent
const data = {
  role: "driver",
  id: "1",
  location: { lat: -6.2, lng: 106.8 },
  status: "available",
};

const message = { msg: "Hello from driver Hendry" };

// Registering socket handlers
socket.on("connect", () => {
  console.log("✅ Connected to server with ID:", socket.id);

  socket.emit("register", data);
  socket.emit("driver:register", data);
  publisher.publish("driver:1", JSON.stringify({ message }));

  // Update location every 10 seconds
  setInterval(() => {
    data.location.lat += 0.001;
    data.location.lng += 0.001;

    socket.emit("driver:updateLocation", data);
  }, 1 * 1000);
});

socket.on("message", (data) => {
  console.log("📩 Server:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});

socket.on("connect_error", (err: Error) => {
  console.error("⚠️ Connection error:", err.message);
});

console.log("Completed");
