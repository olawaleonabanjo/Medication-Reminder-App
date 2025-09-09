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

export default app;