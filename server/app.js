<<<<<<< HEAD
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

=======
import { PORT } from './config/env.js';
import express from 'express';
import cors from 'cors';
import connectDB from './database/mongodb.js'
import router from './routes/auth.route.js';
import medicationRoutes from  './routes/medication.route.js';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', router);
app.use('/api/medications', medicationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medication Reminder API is running' });
});

// 404 handler
app.use('/', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

 app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

>>>>>>> 003cce6 ( Medication Reminder App backend)
export default app;