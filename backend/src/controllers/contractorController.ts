import { Request, Response } from 'express';
import * as contractorModel from '../models/contractorModel';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

/**
 * Get all contractors
 * @route GET /api/contractors
 * @access Owner, SuperAdmin
 */
export async function getAllContractors(req: AuthRequest, res: Response) {
  const contractors = await contractorModel.getAllContractors();

  res.json({
    status: 'success',
    data: contractors,
  });
}

/**
 * Get contractor by ID
 * @route GET /api/contractors/:id
 * @access Owner, SuperAdmin
 */
export async function getContractorById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const contractor = await contractorModel.getContractorById(id);

  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  res.json({
    status: 'success',
    data: contractor,
  });
}

/**
 * Create new contractor
 * @route POST /api/contractors
 * @access Owner, SuperAdmin
 */
export async function createContractor(req: AuthRequest, res: Response) {
  const { nombre, especialidad, telefono } = req.body;

  const newContractor = await contractorModel.createContractor({
    nombre,
    especialidad,
    telefono,
  });

  res.status(201).json({
    status: 'success',
    data: newContractor,
  });
}

/**
 * Update contractor
 * @route PUT /api/contractors/:id
 * @access Owner, SuperAdmin
 */
export async function updateContractor(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { nombre, especialidad, telefono } = req.body;

  // Check if contractor exists
  const existingContractor = await contractorModel.getContractorById(id);
  if (!existingContractor) {
    throw new AppError('Contractor not found', 404);
  }

  const updatedContractor = await contractorModel.updateContractor(id, {
    nombre,
    especialidad,
    telefono,
  });

  res.json({
    status: 'success',
    data: updatedContractor,
  });
}

/**
 * Delete contractor
 * @route DELETE /api/contractors/:id
 * @access Owner, SuperAdmin
 */
export async function deleteContractor(req: AuthRequest, res: Response) {
  const { id } = req.params;

  // Check if contractor exists
  const existingContractor = await contractorModel.getContractorById(id);
  if (!existingContractor) {
    throw new AppError('Contractor not found', 404);
  }

  const deleted = await contractorModel.deleteContractor(id);

  if (!deleted) {
    throw new AppError('Failed to delete contractor', 500);
  }

  res.json({
    status: 'success',
    message: 'Contractor deleted successfully',
  });
}

/**
 * Search contractors
 * @route GET /api/contractors/search?q=searchTerm
 * @access Owner, SuperAdmin
 */
export async function searchContractors(req: AuthRequest, res: Response) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    throw new AppError('Search term is required', 400);
  }

  const contractors = await contractorModel.searchContractors(q);

  res.json({
    status: 'success',
    data: contractors,
  });
}
