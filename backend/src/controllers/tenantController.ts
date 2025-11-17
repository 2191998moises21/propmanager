import { Request, Response } from 'express';
import * as tenantModel from '../models/tenantModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

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
