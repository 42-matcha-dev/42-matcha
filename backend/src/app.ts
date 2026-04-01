import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';
import likeRoutes from './routes/like.routes.js';
import geocodingRoutes from './routes/geocoding.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import blockRoutes from './routes/block.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', uploadRoutes);
app.use('/api/conversations', conversationRoutes);

export default app;