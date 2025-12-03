import { Request, Response } from 'express';
import * as notificationModel from '../models/notificationModel';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

/**
 * Get user's notifications
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const limit = parseInt(req.query.limit as string) || 50;

  const notifications = await notificationModel.getNotificationsByUserId(
    req.user.id,
    req.user.role,
    limit
  );

  res.status(200).json({
    success: true,
    data: notifications,
  });
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const count = await notificationModel.getUnreadCount(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { count },
  });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const { id } = req.params;

  const success = await notificationModel.markAsRead(id, req.user.id);

  if (!success) {
    throw new ApiError('Notification not found', 404);
  }

  logger.info('Notification marked as read:', { notificationId: id, userId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  await notificationModel.markAllAsRead(req.user.id, req.user.role);

  logger.info('All notifications marked as read:', { userId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  const { id } = req.params;

  const success = await notificationModel.deleteNotification(id, req.user.id);

  if (!success) {
    throw new ApiError('Notification not found', 404);
  }

  logger.info('Notification deleted:', { notificationId: id, userId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
};
