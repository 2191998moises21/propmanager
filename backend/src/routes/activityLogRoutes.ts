import { Router } from 'express';
import * as activityLogController from '../controllers/activityLogController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { createActivityLogSchema } from '../validators/activityLogValidators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get activity stats (SuperAdmin only) - Must be before /:id to avoid conflict
router.get(
  '/stats',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.getActivityStats)
);

// Get recent activity logs (SuperAdmin only) - Must be before /:id to avoid conflict
router.get(
  '/recent',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.getRecentActivityLogs)
);

// Delete old activity logs (SuperAdmin only) - Must be before /:id to avoid conflict
router.delete(
  '/cleanup',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.deleteOldActivityLogs)
);

// Get activity logs by user (SuperAdmin or the user themselves)
router.get(
  '/user/:userId',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(activityLogController.getActivityLogsByUser)
);

// Get activity logs by action (SuperAdmin only)
router.get(
  '/action/:accion',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.getActivityLogsByAction)
);

// Get all activity logs with filters (SuperAdmin only)
router.get(
  '/',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.getAllActivityLogs)
);

// Get activity log by ID (SuperAdmin only)
router.get(
  '/:id',
  authorize(UserRole.SuperAdmin),
  asyncHandler(activityLogController.getActivityLogById)
);

// Create activity log (All authenticated users can log their own actions)
router.post(
  '/',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  validate(createActivityLogSchema),
  asyncHandler(activityLogController.createActivityLog)
);

export default router;
