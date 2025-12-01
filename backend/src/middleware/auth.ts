import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';
import { logger } from '../config/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

/**
 * Middleware to verify JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Authorization header required.',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token with explicit secret type
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    req.user = decoded;

    logger.debug('User authenticated:', { userId: decoded.id, role: decoded.role });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Please authenticate first.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
export const authorizeOwner = (ownerIdParam: string = 'ownerId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const ownerId = req.params[ownerIdParam] || req.body[ownerIdParam];

    if (req.user.role === UserRole.SuperAdmin) {
      next();
      return;
    }

    if (req.user.role === UserRole.Owner && req.user.id === ownerId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Forbidden. You can only access your own resources.',
    });
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn } as SignOptions
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string => {
  const refreshSecret = (process.env.JWT_REFRESH_SECRET || JWT_SECRET) as string;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  return jwt.sign(
    payload,
    refreshSecret,
    { expiresIn } as SignOptions
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  const refreshSecret = (process.env.JWT_REFRESH_SECRET || JWT_SECRET) as string;
  return jwt.verify(token, refreshSecret) as JWTPayload;
};

