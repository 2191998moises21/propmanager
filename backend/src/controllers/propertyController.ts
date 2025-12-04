import { Request, Response } from 'express';
import * as propertyModel from '../models/propertyModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Get all properties for authenticated owner
 * Supports optional pagination via query params: ?page=1&limit=10
 */
export const getMyProperties = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== UserRole.Owner) {
    throw new ApiError('Only owners can access this endpoint', 403);
  }

  const { page, limit } = req.query;

  // If pagination params provided, use paginated query
  if (page || limit) {
    const pageNum = parseInt((page as string) || '1');
    const limitNum = parseInt((limit as string) || '20');
    const offset = (pageNum - 1) * limitNum;

    const { properties, total } = await propertyModel.getPropertiesByOwnerIdPaginated(
      req.user.id,
      limitNum,
      offset
    );

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
  } else {
    // Backward compatibility: return all properties if no pagination params
    const properties = await propertyModel.getPropertiesByOwnerId(req.user.id);

    res.json({
      success: true,
      data: properties,
    });
  }
};

/**
 * Get property by ID
 */
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const property = await propertyModel.getPropertyById(id);

  if (!property) {
    throw new ApiError('Property not found', 404);
  }

  // Check ownership (owners can only see their own properties, admins can see all)
  if (req.user?.role === UserRole.Owner && property.owner_id !== req.user.id) {
    throw new ApiError('Forbidden', 403);
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
    throw new ApiError('Only owners can create properties', 403);
  }

  // Map imageUrl (camelCase from frontend) to image_url (snake_case for DB)
  const propertyData = { ...req.body };
  if (propertyData.imageUrl !== undefined) {
    propertyData.image_url = propertyData.imageUrl;
    delete propertyData.imageUrl;
  }

  const property = await propertyModel.createProperty(req.user.id, propertyData);

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
    throw new ApiError('Property not found', 404);
  }

  // Check ownership
  if (req.user?.role === UserRole.Owner && existingProperty.owner_id !== req.user.id) {
    throw new ApiError('Forbidden', 403);
  }

  // Map imageUrl (camelCase from frontend) to image_url (snake_case for DB)
  const updateData = { ...req.body };
  if (updateData.imageUrl !== undefined) {
    updateData.image_url = updateData.imageUrl;
    delete updateData.imageUrl;
  }

  const updatedProperty = await propertyModel.updateProperty(id, updateData);

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
    throw new ApiError('Property not found', 404);
  }

  // Check ownership
  if (req.user?.role === UserRole.Owner && existingProperty.owner_id !== req.user.id) {
    throw new ApiError('Forbidden', 403);
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
    throw new ApiError('Only super admins can search all properties', 403);
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
