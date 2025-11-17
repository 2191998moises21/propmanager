import { Request, Response } from 'express';
import * as propertyModel from '../models/propertyModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Get all properties for authenticated owner
 */
export const getMyProperties = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== UserRole.Owner) {
    throw new ApiError(403, 'Only owners can access this endpoint');
  }

  const properties = await propertyModel.getPropertiesByOwnerId(req.user.id);

  res.json({
    success: true,
    data: properties,
  });
};

/**
 * Get property by ID
 */
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const property = await propertyModel.getPropertyById(id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Check ownership (owners can only see their own properties, admins can see all)
  if (req.user?.role === UserRole.Owner && property.owner_id !== req.user.id) {
    throw new ApiError(403, 'Forbidden');
  }

  res.json({
    success: true,
    data: property,
  });
};

/**
 * Create new property
 */
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== UserRole.Owner) {
    throw new ApiError(403, 'Only owners can create properties');
  }

  const property = await propertyModel.createProperty(req.user.id, req.body);

  logger.info('Property created:', { propertyId: property.id, ownerId: req.user.id });

  res.status(201).json({
    success: true,
    data: property,
  });
};

/**
 * Update property
 */
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get existing property
  const existingProperty = await propertyModel.getPropertyById(id);

  if (!existingProperty) {
    throw new ApiError(404, 'Property not found');
  }

  // Check ownership
  if (req.user?.role === UserRole.Owner && existingProperty.owner_id !== req.user.id) {
    throw new ApiError(403, 'Forbidden');
  }

  const updatedProperty = await propertyModel.updateProperty(id, req.body);

  logger.info('Property updated:', { propertyId: id });

  res.json({
    success: true,
    data: updatedProperty,
  });
};

/**
 * Delete property
 */
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get existing property
  const existingProperty = await propertyModel.getPropertyById(id);

  if (!existingProperty) {
    throw new ApiError(404, 'Property not found');
  }

  // Check ownership
  if (req.user?.role === UserRole.Owner && existingProperty.owner_id !== req.user.id) {
    throw new ApiError(403, 'Forbidden');
  }

  await propertyModel.deleteProperty(id);

  logger.info('Property deleted:', { propertyId: id });

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
};

/**
 * Search properties (SuperAdmin only)
 */
export const searchProperties = async (req: Request, res: Response): Promise<void> => {
  if (req.user?.role !== UserRole.SuperAdmin) {
    throw new ApiError(403, 'Only super admins can search all properties');
  }

  const { ciudad, estado_ocupacion, tipo_propiedad, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const { properties, total } = await propertyModel.searchProperties({
    ciudad: ciudad as string,
    estado_ocupacion: estado_ocupacion as string,
    tipo_propiedad: tipo_propiedad as string,
    limit: limitNum,
    offset,
  });

  res.json({
    success: true,
    data: properties,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};
