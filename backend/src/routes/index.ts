import { Router } from 'express';
import authRoutes from './authRoutes';
import propertyRoutes from './propertyRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PropManager API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);

// TODO: Add more routes
// router.use('/tenants', tenantRoutes);
// router.use('/contracts', contractRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/tickets', ticketRoutes);

export default router;
