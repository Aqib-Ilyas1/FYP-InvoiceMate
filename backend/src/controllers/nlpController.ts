import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generativeModel } from '../lib/gemini';

const prisma = new PrismaClient();

export const parseNaturalLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Parsing natural language:', req.body);
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const prompt = `You are an invoice data extraction assistant. Parse the following natural language input into structured invoice data.

User input: "${text}"

Extract and return a JSON object with this structure:
{
  "clientName": "client/company name (required)",
  "invoiceDate": "today's date in YYYY-MM-DD if not specified",
  "dueDate": "due date in YYYY-MM-DD if mentioned",
  "currency": "USD, EUR, GBP, etc. (default USD)",
  "paymentTerms": "payment terms if mentioned",
  "notes": "any additional notes",
  "lineItems": [
    {
      "description": "service/product description",
      "quantity": number (default 1),
      "unitPrice": number (extract from hourly rate, price, etc.),
      "taxRate": number (percentage, default 0)
    }
  ]
}

Examples:
- "Invoice John for 5 hours at $100/hr" → John, 5 hours consulting, $100 each
- "Bill ABC Corp for web design $2500" → ABC Corp, web design service, $2500
- "Invoice Sarah: 3 consulting sessions at $150 each" → Sarah, 3 sessions, $150 each
- "Create invoice for TechCo: 10 licenses at 50 dollars, 8% tax" → TechCo, 10 licenses, $50, 8% tax

Important:
- Be flexible with input formats
- Extract quantities and prices accurately
- Default quantity to 1 if not specified
- Create clear, professional descriptions
- Use today's date if no date is mentioned
- Return ONLY valid JSON, no additional text or markdown`;

    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Gemini response text:', responseText);

    // Extract JSON from response
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    console.log('Attempting to parse JSON:', jsonText);

    const parsedData = JSON.parse(jsonText);
    console.log('Parsed data:', parsedData);

    // Try to find existing client
    let clientId = null;
    if (parsedData.clientName) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId,
          clientName: {
            equals: parsedData.clientName,
            mode: 'insensitive',
          },
        },
      });

      if (existingClient) {
        clientId = existingClient.id;
      }
    }

    if (!parsedData.lineItems || !Array.isArray(parsedData.lineItems)) {
      throw new Error('The "lineItems" field is missing or not an array in the parsed data.');
    }

    // Format response
    const response = {
      parsedData: {
        clientId,
        clientName: parsedData.clientName,
        invoiceDate: parsedData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: parsedData.dueDate || null,
        currency: parsedData.currency || 'USD',
        paymentTerms: parsedData.paymentTerms || '',
        notes: parsedData.notes || '',
        lineItems: parsedData.lineItems.map((item: any, index: number) => ({
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          sortOrder: index,
        })),
        source: 'nlp',
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      console.error('NLP Error:', error.message);
      let detail = error.message;
      if (error instanceof SyntaxError) {
        detail = "Failed to parse JSON from the model's response.";
      }
      return res.status(500).json({
        error: 'Failed to parse natural language input',
        details: detail,
      });
    }
    next(error);
  }
};
