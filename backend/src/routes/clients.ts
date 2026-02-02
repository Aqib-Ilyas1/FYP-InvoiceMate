import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const clientValidation = [
  body('clientName')
    .trim()
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ min: 2 })
    .withMessage('Client name must be at least 2 characters'),
  body('clientEmail')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('clientAddress')
    .optional()
    .trim(),
  body('clientPhone')
    .optional()
    .trim(),
  body('taxId')
    .optional()
    .trim(),
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
  query('search')
    .optional()
    .trim(),
];

// Routes
router.post('/', clientValidation, createClient);
router.get('/', paginationValidation, getClients);
router.get('/:id', getClient);
router.put('/:id', clientValidation, updateClient);
router.delete('/:id', deleteClient);

export default router;
