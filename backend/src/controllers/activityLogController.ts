import { Request, Response } from 'express';
import * as activityLogModel from '../models/activityLogModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';

/**
 * Create activity log
 * @route POST /api/activity-logs
 * @access SuperAdmin, Owner, Tenant (can log their own actions)
 */
export async function createActivityLog(req: Request, res: Response) {
  const { user_id, user_type, user_name, accion, descripcion, detalles } = req.body;

  // Verify user can only create logs for themselves (except SuperAdmin)
  if (req.user?.role !== UserRole.SuperAdmin && req.user?.id !== user_id) {
    throw new ApiError('You can only create logs for your own actions', 403);
  }

  const log = await activityLogModel.createActivityLog({
    user_id,
    user_type,
    user_name,
    accion,
    descripcion,
    detalles,
  });

  res.status(201).json({
    status: 'success',
    data: log,
  });
}

/**
 * Get all activity logs (with filters and pagination)
 * @route GET /api/activity-logs
 * @access SuperAdmin only
 */
export async function getAllActivityLogs(req: Request, res: Response) {
  const {
    limit,
    offset,
    user_id,
    user_type,
    accion,
    fecha_desde,
    fecha_hasta,
  } = req.query;

  const params = {
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined,
    user_id: user_id as string | undefined,
    user_type: user_type as UserRole | undefined,
    accion: accion as string | undefined,
    fecha_desde: fecha_desde as string | undefined,
    fecha_hasta: fecha_hasta as string | undefined,
  };

  const result = await activityLogModel.getAllActivityLogs(params);

  res.json({
    status: 'success',
    data: result.logs,
    pagination: {
      total: result.total,
      limit: params.limit || 50,
      offset: params.offset || 0,
      pages: Math.ceil(result.total / (params.limit || 50)),
    },
  });
}

/**
 * Get activity log by ID
 * @route GET /api/activity-logs/:id
 * @access SuperAdmin only
 */
export async function getActivityLogById(req: Request, res: Response) {
  const { id } = req.params;

  const log = await activityLogModel.getActivityLogById(id);

  if (!log) {
    throw new ApiError('Activity log not found', 404);
  }

  res.json({
    status: 'success',
    data: log,
  });
}

/**
 * Get activity logs by user
 * @route GET /api/activity-logs/user/:userId
 * @access SuperAdmin, or the user themselves
 */
export async function getActivityLogsByUser(req: Request, res: Response) {
  const { userId } = req.params;
  const { limit, offset } = req.query;

  // Verify user can only view their own logs (except SuperAdmin)
  if (req.user?.role !== UserRole.SuperAdmin && req.user?.id !== userId) {
    throw new ApiError('You can only view your own activity logs', 403);
  }

  const result = await activityLogModel.getActivityLogsByUser(
    userId,
    limit ? parseInt(limit as string, 10) : 50,
    offset ? parseInt(offset as string, 10) : 0
  );

  res.json({
    status: 'success',
    data: result.logs,
    pagination: {
      total: result.total,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      pages: Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 50)),
    },
  });
}

/**
 * Get activity logs by action
 * @route GET /api/activity-logs/action/:accion
 * @access SuperAdmin only
 */
export async function getActivityLogsByAction(req: Request, res: Response) {
  const { accion } = req.params;
  const { limit, offset } = req.query;

  const result = await activityLogModel.getActivityLogsByAction(
    accion,
    limit ? parseInt(limit as string, 10) : 50,
    offset ? parseInt(offset as string, 10) : 0
  );

  res.json({
    status: 'success',
    data: result.logs,
    pagination: {
      total: result.total,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      pages: Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 50)),
    },
  });
}

/**
 * Get recent activity logs
 * @route GET /api/activity-logs/recent
 * @access SuperAdmin only
 */
export async function getRecentActivityLogs(req: Request, res: Response) {
  const { limit } = req.query;

  const logs = await activityLogModel.getRecentActivityLogs(
    limit ? parseInt(limit as string, 10) : 20
  );

  res.json({
    status: 'success',
    data: logs,
  });
}

/**
 * Get activity statistics
 * @route GET /api/activity-logs/stats
 * @access SuperAdmin only
 */
export async function getActivityStats(req: Request, res: Response) {
  const { fecha_desde, fecha_hasta } = req.query;

  const stats = await activityLogModel.getActivityStats({
    fecha_desde: fecha_desde as string | undefined,
    fecha_hasta: fecha_hasta as string | undefined,
  });

  res.json({
    status: 'success',
    data: stats,
  });
}

/**
 * Delete old activity logs (data retention)
 * @route DELETE /api/activity-logs/cleanup
 * @access SuperAdmin only
 */
export async function deleteOldActivityLogs(req: Request, res: Response) {
  const { daysToKeep } = req.query;

  const deleted = await activityLogModel.deleteOldActivityLogs(
    daysToKeep ? parseInt(daysToKeep as string, 10) : 90
  );

  res.json({
    status: 'success',
    message: `Deleted ${deleted} old activity logs`,
    data: { deleted },
  });
}
