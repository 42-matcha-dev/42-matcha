import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
