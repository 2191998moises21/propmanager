import { Router } from 'express';
import * as tenantController from '../controllers/tenantController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all tenants (Owner sees their tenants, SuperAdmin sees all - controller validates)
router.get(
  '/',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(tenantController.getTenants)
);

// Get tenant by ID (Owner, Tenant or SuperAdmin - controller validates ownership)
router.get(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(tenantController.getTenantById)
);

// Update tenant (Tenant can update own profile, Owner/Admin can update any - controller validates)
router.put(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(tenantController.updateTenant)
);

// Delete tenant (Owner/SuperAdmin only)
router.delete(
  '/:id',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(tenantController.deleteTenant)
);

export default router;
