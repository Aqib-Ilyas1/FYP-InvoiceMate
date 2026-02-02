import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { createWorker } from 'tesseract.js';

const prisma = new PrismaClient();

// Helper function to parse extracted text
const parseExtractedText = (text: string) => {
  const extractedData: any = {
    lineItems: [],
  };

  // Very basic regex patterns - these would need to be much more robust for production
  const patterns = {
    invoiceNumber: /invoice number[:\s]+(\w+)/i,
    invoiceDate: /invoice date[:\s]+(\w+\s+\d{1,2},\s+\d{4})/i,
    dueDate: /due date[:\s]+(\w+\s+\d{1,2},\s+\d{4})/i,
    total: /total[:\s]+\$(\d+\.\d{2})/i,
    clientName: /bill to[:\s]+(\w+\s+\w+)/i,
  };

  for (const key in patterns) {
    const match = text.match(patterns[key as keyof typeof patterns]);
    if (match && match[1]) {
      extractedData[key] = match[1].trim();
    }
  }

  // This is a placeholder for line item extraction, which is very complex
  // and would likely require a more advanced parsing strategy.
  const lineItemRegex = /(\w+[\w\s]+)\s+(\d+)\s+\$(\d+\.\d{2})\s+\$(\d+\.\d{2})/g;
  let match;
  while ((match = lineItemRegex.exec(text)) !== null) {
    extractedData.lineItems.push({
      description: match[1].trim(),
      quantity: parseInt(match[2]),
      unitPrice: parseFloat(match[3]),
      lineTotal: parseFloat(match[4]),
    });
  }

  return extractedData;
};

export const processInvoiceImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Processing invoice image with Tesseract:', req.file);
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    console.log('Recognized text:', text);

    const extractedData = parseExtractedText(text);
    console.log('Extracted data:', extractedData);


    // Clean up: delete the uploaded file
    fs.unlinkSync(imagePath);

    res.json({ extractedData });

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
