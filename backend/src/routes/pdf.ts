import { Router } from 'express';
import { generateInvoicePDF } from '../controllers/pdfController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// PDF generation endpoint
router.get('/invoices/:id', generateInvoicePDF);

export default router;
