import { Router } from 'express';
import authRoutes from './authRoutes';
import propertyRoutes from './propertyRoutes';
import contractRoutes from './contractRoutes';
import paymentRoutes from './paymentRoutes';
import ticketRoutes from './ticketRoutes';
import tenantRoutes from './tenantRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PropManager API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v1/auth',
      properties: '/api/v1/properties',
      contracts: '/api/v1/contracts',
      payments: '/api/v1/payments',
      tickets: '/api/v1/tickets',
      tenants: '/api/v1/tenants',
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/contracts', contractRoutes);
router.use('/payments', paymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tenants', tenantRoutes);

export default router;
