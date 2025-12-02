import { Request, Response } from 'express';
import * as ticketModel from '../models/ticketModel';
import { ApiError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { logger } from '../config/logger';

/**
 * Get tickets for authenticated user
 */
export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  let tickets;

  if (req.user.role === UserRole.Owner) {
    tickets = await ticketModel.getTicketsByOwnerId(req.user.id);
  } else if (req.user.role === UserRole.Tenant) {
    tickets = await ticketModel.getTicketsByTenantId(req.user.id);
  } else {
    throw new ApiError('Forbidden', 403);
  }

  res.json({
    success: true,
    data: tickets,
  });
};

/**
 * Get tickets for a property
 */
export const getTicketsByProperty = async (req: Request, res: Response): Promise<void> => {
  const { propertyId } = req.params;

  const tickets = await ticketModel.getTicketsByPropertyId(propertyId);

  res.json({
    success: true,
    data: tickets,
  });
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const ticket = await ticketModel.getTicketById(id);

  if (!ticket) {
    throw new ApiError('Ticket not found', 404);
  }

  res.json({
    success: true,
    data: ticket,
  });
};

/**
 * Create ticket
 */
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const ticket = await ticketModel.createTicket(req.body);

  logger.info('Ticket created:', { ticketId: ticket.id });

  res.status(201).json({
    success: true,
    data: ticket,
  });
};

/**
 * Update ticket
 */
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const updatedTicket = await ticketModel.updateTicket(id, req.body);

  if (!updatedTicket) {
    throw new ApiError('Ticket not found', 404);
  }

  logger.info('Ticket updated:', { ticketId: id });

  res.json({
    success: true,
    data: updatedTicket,
  });
};

/**
 * Delete ticket
 */
export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const deleted = await ticketModel.deleteTicket(id);

  if (!deleted) {
    throw new ApiError('Ticket not found', 404);
  }

  logger.info('Ticket deleted:', { ticketId: id });

  res.json({
    success: true,
    message: 'Ticket deleted successfully',
  });
};
