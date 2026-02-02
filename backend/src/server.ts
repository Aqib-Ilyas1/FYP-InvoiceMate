import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import ocrRoutes from './routes/ocr';
import nlpRoutes from './routes/nlp';
import pdfRoutes from './routes/pdf';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
