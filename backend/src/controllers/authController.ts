import { Request, Response } from 'express';
import * as authModel from '../models/authModel';
import * as passwordResetModel from '../models/passwordResetModel';
import * as refreshTokenModel from '../models/refreshTokenModel';
import { generateToken } from '../middleware/auth';
import { UserRole, LoginRequest, LoginResponse } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { sendPasswordResetEmail } from '../services/emailService';

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

  // Generate access token (expires in 15 minutes)
  const token = generateToken({
    id: user.id,
    email: user.email,
    role,
  });

  // Create and store refresh token (expires in 7 days)
  const refreshTokenDoc = await refreshTokenModel.createRefreshToken(user.id, role);

  logger.info('User logged in:', { userId: user.id, role });

  const response: LoginResponse = {
    token,
    refreshToken: refreshTokenDoc.token,
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

  // Revoke all refresh tokens for security (force re-login on all devices)
  await refreshTokenModel.revokeAllUserTokens(req.user.id);

  logger.info('Password changed and all tokens revoked:', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Password updated successfully. Please log in again.',
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

/**
 * Forgot password - Send reset email
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, role } = req.body;

  // Find user
  const user = await authModel.findUserByEmailAndRole(email, role);

  // Always return success to prevent email enumeration
  if (!user) {
    logger.warn('Password reset requested for non-existent user:', { email, role });
    res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
    return;
  }

  // Check if there's a recent token (rate limiting)
  const recentToken = await passwordResetModel.findRecentTokenByEmail(email, 5);
  if (recentToken) {
    res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
    return;
  }

  // Create reset token
  const resetToken = await passwordResetModel.createPasswordResetToken(user.id, role, email);

  // Send email
  const emailSent = await sendPasswordResetEmail(
    email,
    user.nombre_completo,
    resetToken.token
  );

  if (!emailSent) {
    logger.error('Failed to send password reset email:', { email });
  }

  logger.info('Password reset requested:', { userId: user.id, email });

  res.json({
    success: true,
    message: 'Si el email existe, recibirás un enlace de recuperación',
  });
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  // Find valid token
  const resetToken = await passwordResetModel.findValidToken(token);

  if (!resetToken) {
    throw new ApiError('Token inválido o expirado', 400);
  }

  // Update password
  await authModel.updatePassword(resetToken.user_id, newPassword, resetToken.user_role);

  // Mark token as used
  await passwordResetModel.markTokenAsUsed(resetToken.id);

  // Delete all password reset tokens for this user
  await passwordResetModel.deleteUserTokens(resetToken.user_id);

  // Revoke all refresh tokens for security (force re-login on all devices)
  await refreshTokenModel.revokeAllUserTokens(resetToken.user_id);

  logger.info('Password reset successful and all tokens revoked:', { userId: resetToken.user_id });

  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente. Por favor inicie sesión nuevamente.',
  });
};

/**
 * Refresh access token using refresh token
 * Implements token rotation for security
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError('Refresh token is required', 400);
  }

  // Find and validate refresh token
  const tokenDoc = await refreshTokenModel.findValidRefreshToken(refreshToken);

  if (!tokenDoc) {
    throw new ApiError('Invalid or expired refresh token', 401);
  }

  // Get user to ensure they still exist
  const user = await authModel.findUserByEmailAndRole(
    tokenDoc.user_id,
    tokenDoc.user_role
  );

  if (!user) {
    // Revoke token if user doesn't exist
    await refreshTokenModel.revokeRefreshToken(tokenDoc.id);
    throw new ApiError('User not found', 404);
  }

  // Token Rotation: Revoke the old refresh token
  await refreshTokenModel.revokeRefreshToken(tokenDoc.id);

  // Generate new access token
  const newAccessToken = generateToken({
    id: user.id,
    email: user.email,
    role: tokenDoc.user_role,
  });

  // Generate new refresh token
  const newRefreshTokenDoc = await refreshTokenModel.createRefreshToken(
    user.id,
    tokenDoc.user_role
  );

  logger.info('Tokens refreshed:', { userId: user.id, role: tokenDoc.user_role });

  res.json({
    success: true,
    data: {
      token: newAccessToken,
      refreshToken: newRefreshTokenDoc.token,
    },
  });
};

/**
 * Logout - Revoke refresh token
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenDoc = await refreshTokenModel.findValidRefreshToken(refreshToken);
    if (tokenDoc) {
      await refreshTokenModel.revokeRefreshToken(tokenDoc.id);
      logger.info('User logged out:', { userId: tokenDoc.user_id });
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Logout from all devices - Revoke all refresh tokens for user
 */
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  await refreshTokenModel.revokeAllUserTokens(req.user.id);

  logger.info('User logged out from all devices:', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Logged out from all devices successfully',
  });
};
