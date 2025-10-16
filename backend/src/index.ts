import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT_BACKEND;

app.use(cors());
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
