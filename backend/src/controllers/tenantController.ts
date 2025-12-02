import { Request, Response } from 'express';
import * as tenantModel from '../models/tenantModel';
import * as authModel from '../models/authModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';
import crypto from 'crypto';

/**
 * Generate a secure random password
 */
const generateTemporaryPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
};

/**
 * Create new tenant (Owner/SuperAdmin only)
 */
export const createTenant = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role === UserRole.Tenant) {
    throw new ApiError(403, 'Only owners and admins can create tenants');
  }

  const { nombre_completo, documento_id, email, telefono, password } = req.body;

  // Check if email already exists
  const existingTenant = await authModel.findUserByEmailAndRole(email, UserRole.Tenant);
  if (existingTenant) {
    throw new ApiError(409, 'Email already in use');
  }

  // Generate temporary password if not provided
  const temporaryPassword = password || generateTemporaryPassword();

  // Create tenant
  const tenant = await authModel.createTenant({
    nombre_completo,
    documento_id,
    email,
    telefono,
    password: temporaryPassword,
  });

  logger.info('Tenant created:', { tenantId: tenant.id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    data: {
      tenant,
      temporaryPassword, // Return password so owner can share it with tenant
    },
    message: 'Tenant created successfully. Please share the temporary password with the tenant.',
  });
};

/**
 * Get all tenants (Owner can see their tenants, SuperAdmin can see all)
 */
export const getTenants = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  let tenants;

  if (req.user.role === UserRole.SuperAdmin) {
    tenants = await tenantModel.getAllTenants();
  } else if (req.user.role === UserRole.Owner) {
    tenants = await tenantModel.getTenantsByOwnerId(req.user.id);
  } else {
    throw new ApiError(403, 'Forbidden');
  }

  res.json({
    success: true,
    data: tenants,
  });
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const tenant = await tenantModel.getTenantById(id);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  res.json({
    success: true,
    data: tenant,
  });
};

/**
 * Update tenant
 */
export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Tenants can only update their own profile, owners/admins can update any
  if (req.user?.role === UserRole.Tenant && req.user.id !== id) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const updatedTenant = await tenantModel.updateTenant(id, req.body);

  if (!updatedTenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  logger.info('Tenant updated:', { tenantId: id });

  res.json({
    success: true,
    data: updatedTenant,
  });
};

/**
 * Delete tenant (Owner/SuperAdmin only)
 */
export const deleteTenant = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role === UserRole.Tenant) {
    throw new ApiError(403, 'Only owners and admins can delete tenants');
  }

  const { id } = req.params;

  const deleted = await tenantModel.deleteTenant(id);

  if (!deleted) {
    throw new ApiError(404, 'Tenant not found');
  }

  logger.info('Tenant deleted:', { tenantId: id });

  res.json({
    success: true,
    message: 'Tenant deleted successfully',
  });
};
