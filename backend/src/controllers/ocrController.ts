import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import { createWorker } from 'tesseract.js';

const prisma = new PrismaClient();

// Helper function to parse extracted text
const parseExtractedText = (text: string) => {
  const extractedData: any = {
    lineItems: [],
  };

  const patterns = {
    invoiceNumber: /ID#(\d+)/,
    invoiceDate: /(\d{1,2}\s+\w+\s+\d{4})/,
    clientName: /Sent to\n(.+?)\n/,
    amount: /Amount\n(.+?)\n/,
    accountNumber: /Bank Account\n(.+?)\n/,
    sender: /Sent by\n(.+?)\n/,
  };

  for (const key in patterns) {
    const match = text.match(patterns[key as keyof typeof patterns]);
    if (match && match[1]) {
      extractedData[key] = match[1].trim();
    }
  }

  // Create a line item from the extracted amount
  if (extractedData.amount) {
    extractedData.lineItems.push({
      description: 'Payment',
      quantity: 1,
      unitPrice: parseFloat(extractedData.amount.replace(/,/g, '')),
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

    // Create a new client if it doesn't exist
    if (extractedData.clientName) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId,
          clientName: {
            equals: extractedData.clientName,
            mode: 'insensitive',
          },
        },
      });

      if (!existingClient) {
        await prisma.client.create({
          data: {
            userId,
            clientName: extractedData.clientName,
          },
        });
      }
    }

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
