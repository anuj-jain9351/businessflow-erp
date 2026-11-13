import express from 'express';
import { getInvoices, createInvoice, deleteInvoice } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();
router.use(protect);

router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').delete(deleteInvoice);

export default router;