import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.NODE_ENV;

app.use(cors());
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
