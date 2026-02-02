import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { createWorker } from 'tesseract.js';

const prisma = new PrismaClient();

export const processInvoiceImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Processing invoice image with Tesseract:', req.file);
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;

    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    console.log('Recognized text:', text);

    // Clean up: delete the uploaded file
    fs.unlinkSync(imagePath);

    // For now, return the recognized text
    res.json({ recognizedText: text });

  } catch (error) {
    // Clean up file on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    if (error instanceof Error) {
      console.error('OCR Error:', error.message);
      return res.status(500).json({
        error: 'Failed to process invoice image',
        details: error.message
      });
    }
    next(error);
  }
};
