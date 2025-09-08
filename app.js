import express from 'express';
import { PORT } from './config/env.js';
import connectDB from './database/mongodb.js'



const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(PORT, async() => {
  console.log(`Server is running on http://localhost:${PORT}`);

 await connectDB();
});

export default app;