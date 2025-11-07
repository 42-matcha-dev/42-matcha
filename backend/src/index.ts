import express from 'express';
import cors from 'cors';
import { initDB } from './database/init.js';
import { seedTestUsers } from './database/seed.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';

const app = express();
const port = process.env.PORT_BACKEND;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api', uploadRoutes);
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

initDB().then(async () => {
  // Seed test users if enabled
  await seedTestUsers();

  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
