import { Request, Response } from 'express';
import * as paymentModel from '../models/paymentModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Get payments for authenticated user
 */
export const getMyPayments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  let payments;

  if (req.user.role === UserRole.Owner) {
    payments = await paymentModel.getPaymentsByOwnerId(req.user.id);
  } else if (req.user.role === UserRole.Tenant) {
    payments = await paymentModel.getPaymentsByTenantId(req.user.id);
  } else {
    throw new ApiError('Forbidden', 403);
  }

  res.json({
    success: true,
    data: payments,
  });
};

/**
 * Get payments for a contract
 */
export const getPaymentsByContract = async (req: Request, res: Response): Promise<void> => {
  const { contractId } = req.params;

  const payments = await paymentModel.getPaymentsByContractId(contractId);

  res.json({
    success: true,
    data: payments,
  });
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const payment = await paymentModel.getPaymentById(id);

  if (!payment) {
    throw new ApiError('Payment not found', 404);
  }

  res.json({
    success: true,
    data: payment,
  });
};

/**
 * Create payment
 */
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const payment = await paymentModel.createPayment(req.body);

  logger.info('Payment created:', { paymentId: payment.id });

  res.status(201).json({
    success: true,
    data: payment,
  });
};

/**
 * Update payment
 */
export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const updatedPayment = await paymentModel.updatePayment(id, req.body);

  if (!updatedPayment) {
    throw new ApiError('Payment not found', 404);
  }

  logger.info('Payment updated:', { paymentId: id });

  res.json({
    success: true,
    data: updatedPayment,
  });
};

/**
 * Upload payment proof
 */
export const uploadPaymentProof = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { proofUrl } = req.body;

  if (!proofUrl) {
    throw new ApiError('Proof URL is required', 400);
  }

  const payment = await paymentModel.uploadPaymentProof(id, proofUrl);

  if (!payment) {
    throw new ApiError('Payment not found', 404);
  }

  logger.info('Payment proof uploaded:', { paymentId: id });

  res.json({
    success: true,
    data: payment,
  });
};

/**
 * Get pending payments
 */
export const getPendingPayments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const ownerId = req.user.role === UserRole.Owner ? req.user.id : undefined;

  const payments = await paymentModel.getPendingPayments(ownerId);

  res.json({
    success: true,
    data: payments,
  });
};
