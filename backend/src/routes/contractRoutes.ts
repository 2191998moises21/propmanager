import { Router } from 'express';
import * as contractController from '../controllers/contractController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my contracts (Owner or Tenant can view their own)
router.get(
  '/my',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(contractController.getMyContracts)
);

// Get contract by ID (Owner, Tenant or SuperAdmin - controller validates ownership)
router.get(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(contractController.getContractById)
);

// Create contract (Owner only)
router.post('/', authorize(UserRole.Owner), asyncHandler(contractController.createContract));

// Update contract (Owner only - controller validates ownership)
router.put(
  '/:id',
  authorize(UserRole.Owner),
  asyncHandler(contractController.updateContract)
);

// Terminate contract (Owner only - controller validates ownership)
router.post(
  '/:id/terminate',
  authorize(UserRole.Owner),
  asyncHandler(contractController.terminateContract)
);

// Contract documents
// Get documents (Owner, Tenant or SuperAdmin - controller validates)
router.get(
  '/:id/documents',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(contractController.getContractDocuments)
);

// Add document (Owner only - controller validates ownership)
router.post(
  '/:id/documents',
  authorize(UserRole.Owner),
  asyncHandler(contractController.addContractDocument)
);

export default router;
