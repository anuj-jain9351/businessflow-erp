import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorizeCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorizeCompany([]), getDashboardStats);

export default router;