import { Request, Response } from 'express';
import * as authModel from '../models/authModel';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { UserRole, LoginRequest, LoginResponse } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

/**
 * Login user
 */
export const login = async (
  req: Request<object, object, LoginRequest>,
  res: Response
): Promise<void> => {
  const { email, password, role } = req.body;

  // Find user by email and role
  const user = await authModel.findUserByEmailAndRole(email, role);

  if (!user || !user.password_hash) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await authModel.verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Generate tokens
  const token = generateToken({
    id: user.id,
    email: user.email,
    role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role,
  });

  logger.info('User logged in:', { userId: user.id, role });

  const response: LoginResponse = {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      nombre_completo: user.nombre_completo,
      role,
    },
  };

  res.json({
    success: true,
    data: response,
  });
};

/**
 * Register new owner
 */
export const registerOwner = async (req: Request, res: Response): Promise<void> => {
  const { nombre_completo, email, password, telefono, direccion } = req.body;

  // Check if email already exists
  const existingUser = await authModel.findUserByEmailAndRole(email, UserRole.Owner);

  if (existingUser) {
    throw new ApiError('Email already in use', 409);
  }

  // Create owner
  const owner = await authModel.createOwner({
    nombre_completo,
    email,
    password,
    telefono,
    direccion,
  });

  // Generate tokens
  const token = generateToken({
    id: owner.id,
    email: owner.email,
    role: UserRole.Owner,
  });

  logger.info('New owner registered:', { ownerId: owner.id });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: owner.id,
        email: owner.email,
        nombre_completo: owner.nombre_completo,
        role: UserRole.Owner,
      },
    },
  });
};

/**
 * Register new tenant
 */
export const registerTenant = async (req: Request, res: Response): Promise<void> => {
  const { nombre_completo, documento_id, email, password, telefono } = req.body;

  // Check if email or documento already exists
  const existingUser = await authModel.findUserByEmailAndRole(email, UserRole.Tenant);

  if (existingUser) {
    throw new ApiError('Email already in use', 409);
  }

  // Create tenant
  const tenant = await authModel.createTenant({
    nombre_completo,
    documento_id,
    email,
    password,
    telefono,
  });

  // Generate token
  const token = generateToken({
    id: tenant.id,
    email: tenant.email,
    role: UserRole.Tenant,
  });

  logger.info('New tenant registered:', { tenantId: tenant.id });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: tenant.id,
        email: tenant.email,
        nombre_completo: tenant.nombre_completo,
        role: UserRole.Tenant,
      },
    },
  });
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const user = await authModel.findUserByEmailAndRole(req.user.email, req.user.role);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const { password_hash: _password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword,
  });
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await authModel.findUserByEmailAndRole(req.user.email, req.user.role);

  if (!user || !user.password_hash) {
    throw new ApiError('User not found', 404);
  }

  // Verify current password
  const isValid = await authModel.verifyPassword(currentPassword, user.password_hash);

  if (!isValid) {
    throw new ApiError('Current password is incorrect', 401);
  }

  // Update password
  await authModel.updatePassword(req.user.id, newPassword, req.user.role);

  logger.info('Password changed:', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const { nombre_completo, telefono, direccion, foto_url, documento_id_url } = req.body;

  let updatedUser;

  if (req.user.role === UserRole.Owner) {
    updatedUser = await authModel.updateOwnerProfile(req.user.id, {
      nombre_completo,
      telefono,
      direccion,
      foto_url,
    });
  } else if (req.user.role === UserRole.Tenant) {
    updatedUser = await authModel.updateTenantProfile(req.user.id, {
      nombre_completo,
      telefono,
      foto_url,
      documento_id_url,
    });
  } else {
    throw new ApiError('Unsupported user role', 400);
  }

  logger.info('Profile updated:', { userId: req.user.id });

  res.json({
    success: true,
    data: updatedUser,
  });
};
