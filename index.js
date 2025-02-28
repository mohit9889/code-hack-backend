import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import hackRoutes from './routes/hack.js';
import { connectDB } from './database/connection.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Environment Variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`Route Called: ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running fine' });
});

// API Routes
app.use('/api/v1', hackRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
