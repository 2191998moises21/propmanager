import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validator';
import { UserRole } from '../types';
import {
  createPaymentSchema,
  updatePaymentSchema,
  uploadPaymentProofSchema,
} from '../validators/paymentValidators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my payments (Owner or Tenant can view their own)
router.get(
  '/my',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(paymentController.getMyPayments)
);

// Get pending payments (Owner or Tenant - controller validates)
router.get(
  '/pending',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(paymentController.getPendingPayments)
);

// Get payments for a contract (Owner, Tenant or SuperAdmin - controller validates)
router.get(
  '/contract/:contractId',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(paymentController.getPaymentsByContract)
);

// Get payment by ID (Owner, Tenant or SuperAdmin - controller validates)
router.get(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(paymentController.getPaymentById)
);

// Create payment (Owner or Tenant - controller validates)
router.post(
  '/',
  authorize(UserRole.Owner, UserRole.Tenant),
  validate(createPaymentSchema),
  asyncHandler(paymentController.createPayment)
);

// Update payment (Owner or Tenant - controller validates ownership)
router.put(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant),
  validate(updatePaymentSchema),
  asyncHandler(paymentController.updatePayment)
);

// Upload payment proof (Tenant uploads, Owner can also - controller validates)
router.post(
  '/:id/proof',
  authorize(UserRole.Owner, UserRole.Tenant),
  validate(uploadPaymentProofSchema),
  asyncHandler(paymentController.uploadPaymentProof)
);

export default router;
