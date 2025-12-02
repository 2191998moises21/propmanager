import { Router } from 'express';
import * as contractorController from '../controllers/contractorController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';
import {
  createContractorSchema,
  updateContractorSchema,
} from '../validators/contractorValidators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search contractors (Owner and SuperAdmin)
router.get(
  '/search',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(contractorController.searchContractors)
);

// Get all contractors (Owner and SuperAdmin)
router.get(
  '/',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(contractorController.getAllContractors)
);

// Get contractor by ID (Owner and SuperAdmin)
router.get(
  '/:id',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(contractorController.getContractorById)
);

// Create contractor (Owner and SuperAdmin)
router.post(
  '/',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  validate(createContractorSchema),
  asyncHandler(contractorController.createContractor)
);

// Update contractor (Owner and SuperAdmin)
router.put(
  '/:id',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  validate(updateContractorSchema),
  asyncHandler(contractorController.updateContractor)
);

// Delete contractor (Owner and SuperAdmin)
router.delete(
  '/:id',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(contractorController.deleteContractor)
);

export default router;
