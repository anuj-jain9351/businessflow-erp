import express from 'express';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

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
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);

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




export const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId, // Tenant boundary check
    }).populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({ success: true, client });
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching client details' });
  }
};

export const updateClient = async (req, res) => {
  try {
    let client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    console.error('Update Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating client' });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client removed successfully',
    });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting client' });
  }
};



// {
//   "success": true,
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTVlODEzYjE2NzY4NzBmNjk2NzhkMSIsImlhdCI6MTc5NDM5MjcwMiwiZXhwIjoxNzk0OTk3NTAyfQ.q3zxpdR-wpfmJrs1PAN-NSoZN0zDvzT0XmwlzSIEZPA",
//   "user": {
//     "id": "6ae5e813b1676870f69678d1",
//     "name": "Anuj Jain",
//     "email": "anuj@example.com",
//     "isPlatformAdmin": false
//   },
//   "memberships": [
//     {
//       "companyId": "6ae5e814b1676870f69678d2",
//       "companyName": "Tech Innovators Pvt Ltd",
//       "slug": "tech-innovators-pvt-ltd-6736",
//       "role": "Company Owner"
//     }
//   ]
// }