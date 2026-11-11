import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorizeCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    createProject
  )
  .get(
    authorizeCompany([]),
    getProjects
  );

router.route('/:id')
  .get(
    authorizeCompany([]),
    getProjectById
  )
  .put(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    updateProject
  )
  .delete(
    authorizeCompany(['Company Owner', 'Admin']),
    deleteProject
  );

export default router;