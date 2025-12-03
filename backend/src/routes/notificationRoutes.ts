import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for current user
router.get('/', asyncHandler(notificationController.getNotifications));

// Get unread count
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

// Mark notification as read
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

// Mark all notifications as read
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));

// Delete notification
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

export default router;
