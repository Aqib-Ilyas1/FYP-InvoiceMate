import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientName, clientEmail, clientAddress, clientPhone, taxId } = req.body;
    const userId = req.user!.id;

    const client = await prisma.client.create({
      data: {
        userId,
        clientName,
        clientEmail,
        clientAddress,
        clientPhone,
        taxId,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10', search = '' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
      ...(search && {
        OR: [
          { clientName: { contains: search as string, mode: 'insensitive' as const } },
          { clientEmail: { contains: search as string, mode: 'insensitive' as const } },
          { clientPhone: { contains: search as string, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      clients,
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

export const getClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const clientId = parseInt(req.params.id as string);

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
      include: {
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          take: 10,
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const clientId = parseInt(req.params.id as string);
    const { clientName, clientEmail, clientAddress, clientPhone, taxId } = req.body;

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        clientName,
        clientEmail,
        clientAddress,
        clientPhone,
        taxId,
      },
    });

    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const clientId = parseInt(req.params.id as string);

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};
