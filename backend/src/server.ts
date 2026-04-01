import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';

import { initDB } from './database/init.js';
import { seedTestUsers } from './database/seed.js';
import { setupChatSocket } from './socket/chat.handlers.js';
import { setupNotificationSocket } from './socket/notification.handlers.js';

const port = process.env.PORT_BACKEND || 4000;

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

setupChatSocket(io);
setupNotificationSocket(io);

// --- START DB THEN SERVER ---
console.log("🟡 Initializing database...");
initDB()
  .then(async () => {
    console.log("🟢 Database initialized");

    console.log("🟡 Seeding test users...");
    await seedTestUsers();
    console.log("🟢 Test users seeded");

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize DB or start server:", err);
  });

// --- Catch unhandled rejections ---
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
