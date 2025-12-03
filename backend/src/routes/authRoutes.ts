import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  loginSchema,
  registerOwnerSchema,
  registerTenantSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/authValidators';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post(
  '/register/owner',
  validate(registerOwnerSchema),
  asyncHandler(authController.registerOwner)
);
router.post(
  '/register/tenant',
  validate(registerTenantSchema),
  asyncHandler(authController.registerTenant)
);

// Protected routes
router.get('/profile', authenticate, asyncHandler(authController.getProfile));
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

export default router;
