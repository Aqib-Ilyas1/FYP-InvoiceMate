import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Generate unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const prefix = `INV-${year}${month}`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const {
      clientId,
      invoiceDate,
      dueDate,
      currency,
      paymentTerms,
      notes,
      status,
      lineItems,
    } = req.body;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const processedLineItems = lineItems.map((item: any) => {
      const quantity = new Prisma.Decimal(item.quantity || 1);
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const taxRate = new Prisma.Decimal(item.taxRate || 0);

      const lineTotal = quantity.mul(unitPrice);
      const taxAmount = lineTotal.mul(taxRate).div(100);

      subtotal = subtotal.add(lineTotal);
      totalTax = totalTax.add(taxAmount);

      return {
        description: item.description,
        quantity,
        unitPrice,
        taxRate,
        taxAmount,
        lineTotal,
        sortOrder: item.sortOrder || 0,
      };
    });

    const total = subtotal.add(totalTax);

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        clientId: clientId || null,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        currency: currency || 'USD',
        subtotal,
        totalTax,
        total,
        paymentTerms,
        notes,
        status: status || 'draft',
        lineItems: {
          create: processedLineItems,
        },
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('getInvoices query params:', req.query);
    const userId = req.user!.id;
    const {
      page = '1',
      limit = '10',
      search = '',
      status,
      clientId,
      sortBy = 'invoiceDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId,
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
          { client: { clientName: { contains: search as string, mode: 'insensitive' } } },
        ],
      }),
      ...(status && { status: status as string }),
      ...(clientId && { clientId: parseInt(clientId as string) }),
    };

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          client: true,
          _count: {
            select: { lineItems: true, payments: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      invoices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id as string);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id as string);
    const {
      clientId,
      invoiceDate,
      dueDate,
      currency,
      paymentTerms,
      notes,
      status,
      lineItems,
    } = req.body;

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate totals
    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const processedLineItems = lineItems.map((item: any) => {
      const quantity = new Prisma.Decimal(item.quantity || 1);
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const taxRate = new Prisma.Decimal(item.taxRate || 0);

      const lineTotal = quantity.mul(unitPrice);
      const taxAmount = lineTotal.mul(taxRate).div(100);

      subtotal = subtotal.add(lineTotal);
      totalTax = totalTax.add(taxAmount);

      return {
        description: item.description,
        quantity,
        unitPrice,
        taxRate,
        taxAmount,
        lineTotal,
        sortOrder: item.sortOrder || 0,
      };
    });

    const total = subtotal.add(totalTax);

    // Delete existing line items and create new ones
    await prisma.lineItem.deleteMany({
      where: { invoiceId },
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: clientId || null,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        currency: currency || 'USD',
        subtotal,
        totalTax,
        total,
        paymentTerms,
        notes,
        status: status || 'draft',
        lineItems: {
          create: processedLineItems,
        },
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id as string);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id as string);
    const { status } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    next(error);
  }
};
