import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my payments
router.get('/my', asyncHandler(paymentController.getMyPayments));

// Get pending payments
router.get('/pending', asyncHandler(paymentController.getPendingPayments));

// Get payments for a contract
router.get('/contract/:contractId', asyncHandler(paymentController.getPaymentsByContract));

// Get payment by ID
router.get('/:id', asyncHandler(paymentController.getPaymentById));

// Create payment
router.post('/', asyncHandler(paymentController.createPayment));

// Update payment
router.put('/:id', asyncHandler(paymentController.updatePayment));

// Upload payment proof
router.post('/:id/proof', asyncHandler(paymentController.uploadPaymentProof));

export default router;
