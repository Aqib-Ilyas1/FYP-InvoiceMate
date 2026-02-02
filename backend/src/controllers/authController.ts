import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: ApiError = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = errors.array();
    throw error;
  }

  const { email, password, fullName, companyName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    const error: ApiError = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName || null,
      companyName: companyName || null
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      companyName: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );

  res.status(201).json({
    success: true,
    data: {
      user,
      token
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: ApiError = new Error('Validation failed');
    error.statusCode = 400;
    error.errors = errors.array();
    throw error;
  }

  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    const error: ApiError = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    const error: ApiError = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        createdAt: user.createdAt
      },
      token
    }
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    const error: ApiError = new Error('User not authenticated');
    error.statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      companyName: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    const error: ApiError = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: { user }
  });
});
