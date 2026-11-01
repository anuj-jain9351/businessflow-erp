import express from 'express';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security and utility Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend URL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'BusinessFlow ERP API is running successfully! 🚀' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});




//  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTVlODEzYjE2NzY4NzBmNjk2NzhkMSIsImlhdCI6MTc5MzQ1MjA1MiwiZXhwIjoxNzk0MDU2ODUyfQ.AUwo1h5L93LGPxdXd7QMG3P5Sxrx1qgyQ9E5oSwGzc0"