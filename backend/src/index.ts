import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

import { initDB } from './database/init.js';
import { seedTestUsers } from './database/seed.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';
import likeRoutes from './routes/like.routes.js';
import geocodingRoutes from './routes/geocoding.routes.js';
import notificationRoutes from './routes/notification.routes.js'
import conversationRoutes from './routes/conversation.routes.js';
import { setupChatSocket } from './socket/chat.handlers.js';
import { setupNotificationSocket } from './socket/notification.handlers.js';

const app = express();
const port = process.env.PORT_BACKEND || 4000;

console.log("🟢 Starting backend setup...");

// --- EXPRESS SETUP ---
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', uploadRoutes);
app.use('/api/conversations', conversationRoutes);

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

    console.log(`🟡 Starting server on port ${port}...`);
    server.listen(port, () => {
      console.log(`🚀 Express + Socket.IO running at http://localhost:${port}`);
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
