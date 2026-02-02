import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

interface JwtPayload {
  id: number;
  email: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: ApiError = new Error('No token provided');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      const apiError: ApiError = new Error('Invalid token');
      apiError.statusCode = 401;
      return next(apiError);
    }

    if (error.name === 'TokenExpiredError') {
      const apiError: ApiError = new Error('Token expired');
      apiError.statusCode = 401;
      return next(apiError);
    }

    next(error);
  }
};
