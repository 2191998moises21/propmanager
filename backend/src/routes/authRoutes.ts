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
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
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
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(authController.refreshAccessToken)
);
router.post('/logout', validate(logoutSchema), asyncHandler(authController.logout));

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
router.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));

export default router;
