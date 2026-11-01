import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { protect, authorizeCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    createClient
  )
  .get(
    authorizeCompany([]),
    getClients
  );

router.route('/:id')
  .get(
    authorizeCompany([]),
    getClientById
  )
  .put(
    authorizeCompany(['Company Owner', 'Admin', 'Project Manager']),
    updateClient
  )
  .delete(
    authorizeCompany(['Company Owner', 'Admin']),
    deleteClient
  );

export default router;