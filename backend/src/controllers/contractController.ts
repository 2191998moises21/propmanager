import { Request, Response } from 'express';
import * as contractModel from '../models/contractModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Get contracts for authenticated user
 */
export const getMyContracts = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  let contracts;

  if (req.user.role === UserRole.Owner) {
    contracts = await contractModel.getContractsByOwnerId(req.user.id);
  } else if (req.user.role === UserRole.Tenant) {
    contracts = await contractModel.getContractsByTenantId(req.user.id);
  } else {
    throw new ApiError(403, 'Forbidden');
  }

  res.json({
    success: true,
    data: contracts,
  });
};

/**
 * Get contract by ID
 */
export const getContractById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const contract = await contractModel.getContractById(id);

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  res.json({
    success: true,
    data: contract,
  });
};

/**
 * Create contract
 */
export const createContract = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== UserRole.Owner) {
    throw new ApiError(403, 'Only owners can create contracts');
  }

  const contract = await contractModel.createContract(req.body);

  logger.info('Contract created:', { contractId: contract.id, ownerId: req.user.id });

  res.status(201).json({
    success: true,
    data: contract,
  });
};

/**
 * Update contract
 */
export const updateContract = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const updatedContract = await contractModel.updateContract(id, req.body);

  if (!updatedContract) {
    throw new ApiError(404, 'Contract not found');
  }

  logger.info('Contract updated:', { contractId: id });

  res.json({
    success: true,
    data: updatedContract,
  });
};

/**
 * Terminate contract
 */
export const terminateContract = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const contract = await contractModel.terminateContract(id);

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  logger.info('Contract terminated:', { contractId: id });

  res.json({
    success: true,
    data: contract,
  });
};

/**
 * Get contract documents
 */
export const getContractDocuments = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const documents = await contractModel.getContractDocuments(id);

  res.json({
    success: true,
    data: documents,
  });
};

/**
 * Add document to contract
 */
export const addContractDocument = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, url } = req.body;

  const document = await contractModel.addContractDocument(id, { nombre, url });

  logger.info('Document added to contract:', { contractId: id, documentId: document.id });

  res.status(201).json({
    success: true,
    data: document,
  });
};
