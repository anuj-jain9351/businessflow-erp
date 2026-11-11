import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorizeCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    createTask
  )
  .get(
    authorizeCompany([]),
    getTasks
  );

router.route('/:id')
  .put(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    updateTask
  )
  .delete(
    authorizeCompany(['Company Owner', 'Admin']),
    deleteTask
  );

export default router;