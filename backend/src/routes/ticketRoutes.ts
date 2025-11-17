import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my tickets
router.get('/my', asyncHandler(ticketController.getMyTickets));

// Get tickets for a property
router.get('/property/:propertyId', asyncHandler(ticketController.getTicketsByProperty));

// Get ticket by ID
router.get('/:id', asyncHandler(ticketController.getTicketById));

// Create ticket
router.post('/', asyncHandler(ticketController.createTicket));

// Update ticket
router.put('/:id', asyncHandler(ticketController.updateTicket));

// Delete ticket
router.delete('/:id', asyncHandler(ticketController.deleteTicket));

export default router;
