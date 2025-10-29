import express from 'express';
import cors from 'cors';
import { initDB } from './database/init.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const port = process.env.PORT_BACKEND;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

initDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
