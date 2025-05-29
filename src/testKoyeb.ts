import { io, Socket } from "socket.io-client";

function startDriverClient(id: string, lat: number, lng: number) {
  const socket: Socket = io(
    "wss://empirical-giulia-tripnus-68846661.koyeb.app/",
    // "http://localhost:3001",
    {
      transports: ["websocket"],
    }
  );

  socket.on("connect", () => {
    console.log(`✅ Driver ${id} connected with socket ID:`, socket.id);

    const data = {
      role: "driver",
      id,
      location: { lat, lng },
    };

    socket.emit("register", data);
    socket.emit("driver:register", { data });

    // Update location every 1 second
    setInterval(() => {
      data.location.lat += Math.random() * 0.001;
      data.location.lng += Math.random() * 0.001;

      socket.emit("driver:updateLocation", data);
    }, 30 * 1000);
  });

  socket.on("message", (data) => {
    console.log("📩 Server:", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Driver ${id} disconnected`);
  });

  socket.on("connect_error", (err: Error) => {
    console.error(`⚠️ Driver ${id} connection error:`, err.message);
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startDriversInBatches(
  total: number,
  batchSize: number,
  delayMs: number
) {
  for (let i = 1; i <= total; i += batchSize) {
    for (let j = i; j < i + batchSize && j <= total; j++) {
      const id = j.toString();
      const baseLat = -6.2 + j * 0.0001;
      const baseLng = 106.8 + j * 0.0001;
      startDriverClient(id, baseLat, baseLng);
    }
    console.log(
      `Started drivers ${i} to ${Math.min(i + batchSize - 1, total)}`
    );
    await delay(delayMs); // wait before starting next batch
  }
}

// Usage: 2000 drivers, batch 100, delay 2000 ms (2 seconds)
startDriversInBatches(10000, 100, 5 * 1000);
