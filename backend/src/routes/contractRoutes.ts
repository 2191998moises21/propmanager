import { Router } from 'express';
import * as contractController from '../controllers/contractController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my contracts (Owner or Tenant)
router.get('/my', asyncHandler(contractController.getMyContracts));

// Get contract by ID
router.get('/:id', asyncHandler(contractController.getContractById));

// Create contract (Owner only)
router.post('/', authorize(UserRole.Owner), asyncHandler(contractController.createContract));

// Update contract
router.put('/:id', asyncHandler(contractController.updateContract));

// Terminate contract
router.post('/:id/terminate', asyncHandler(contractController.terminateContract));

// Contract documents
router.get('/:id/documents', asyncHandler(contractController.getContractDocuments));
router.post('/:id/documents', asyncHandler(contractController.addContractDocument));

export default router;
