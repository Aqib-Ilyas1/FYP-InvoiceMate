import { Router } from 'express';
import { body } from 'express-validator';
import { parseNaturalLanguage } from '../controllers/nlpController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

const nlpValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text input is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Text must be between 5 and 1000 characters'),
];

// NLP parsing endpoint
router.post('/parse', nlpValidation, parseNaturalLanguage);

export default router;
