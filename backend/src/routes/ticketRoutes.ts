import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my tickets (Owner or Tenant can view their own)
router.get(
  '/my',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(ticketController.getMyTickets)
);

// Get tickets for a property (Owner or SuperAdmin - controller validates ownership)
router.get(
  '/property/:propertyId',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(ticketController.getTicketsByProperty)
);

// Get ticket by ID (Owner, Tenant or SuperAdmin - controller validates)
router.get(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant, UserRole.SuperAdmin),
  asyncHandler(ticketController.getTicketById)
);

// Create ticket (Tenant creates tickets, Owner can also - controller validates)
router.post(
  '/',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(ticketController.createTicket)
);

// Update ticket (Owner or Tenant - controller validates ownership)
router.put(
  '/:id',
  authorize(UserRole.Owner, UserRole.Tenant),
  asyncHandler(ticketController.updateTicket)
);

// Delete ticket (Owner or SuperAdmin - controller validates ownership)
router.delete(
  '/:id',
  authorize(UserRole.Owner, UserRole.SuperAdmin),
  asyncHandler(ticketController.deleteTicket)
);

export default router;
