import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { createPropertySchema, updatePropertySchema } from '../validators/propertyValidators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my properties (Owner only)
router.get('/my', authorize(UserRole.Owner), asyncHandler(propertyController.getMyProperties));

// Search properties (SuperAdmin only)
router.get(
  '/search',
  authorize(UserRole.SuperAdmin),
  asyncHandler(propertyController.searchProperties)
);

// Get property by ID
router.get('/:id', asyncHandler(propertyController.getPropertyById));

// Create property (Owner only)
router.post(
  '/',
  authorize(UserRole.Owner),
  validate(createPropertySchema),
  asyncHandler(propertyController.createProperty)
);

// Update property
router.put('/:id', validate(updatePropertySchema), asyncHandler(propertyController.updateProperty));

// Delete property
router.delete('/:id', asyncHandler(propertyController.deleteProperty));

export default router;
