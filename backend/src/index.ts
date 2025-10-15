import express from 'express';
import cors from 'cors';

const app = express();
<<<<<<< HEAD
const port = process.env.NODE_ENV;
=======
const port = 4000;
>>>>>>> 5f9ad44f83c7629a5ac4308a67cd69dd9e159240

app.use(cors());
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
