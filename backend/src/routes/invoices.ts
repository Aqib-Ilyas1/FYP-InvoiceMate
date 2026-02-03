import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoiceStats,
} from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const invoiceValidation = [
  body('invoiceDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid invoice date is required'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('clientId')
    .optional()
    .isInt()
    .withMessage('Client ID must be a number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  body('lineItems')
    .isArray({ min: 1 })
    .withMessage('At least one line item is required'),
  body('lineItems.*.description')
    .trim()
    .notEmpty()
    .withMessage('Line item description is required'),
  body('lineItems.*.quantity')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a number')
    .toFloat(),
  body('lineItems.*.unitPrice')
    .isNumeric()
    .withMessage('Unit price must be a number')
    .toFloat(),
  body('lineItems.*.taxRate')
    .optional()
    .isNumeric()
    .withMessage('Tax rate must be a number')
    .toFloat(),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  query('sortBy')
    .optional()
    .isIn(['invoiceDate', 'dueDate', 'total', 'invoiceNumber', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const statusValidation = [
  body('status')
    .notEmpty()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
];

// Routes
router.post('/', invoiceValidation, createInvoice);
router.get('/', paginationValidation, getInvoices);
router.get('/stats', getInvoiceStats);
router.get('/:id', getInvoice);
router.put('/:id', invoiceValidation, updateInvoice);
router.delete('/:id', deleteInvoice);
router.patch('/:id/status', statusValidation, updateInvoiceStatus);

export default router;
