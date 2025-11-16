import app from './app';
import { logger } from './config/logger';
import { testConnection, closePool } from './config/database';
import * as fs from 'fs';
import * as path from 'path';

const PORT = parseInt(process.env.PORT || '3001');
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info('🔌 Testing database connection...');
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════╗
║                                            ║
║     🏢 PropManager API Server              ║
║                                            ║
║     Environment: ${NODE_ENV.padEnd(27)}  ║
║     Port:        ${PORT.toString().padEnd(27)}  ║
║     API Version: v1                        ║
║                                            ║
║     ✅ Server is running successfully      ║
║                                            ║
║     📡 http://localhost:${PORT}             ║
║     🏥 Health: /api/v1/health              ║
║                                            ║
╚════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} signal received. Closing server gracefully...`);

      server.close(async () => {
        logger.info('✅ Express server closed');

        try {
          await closePool();
          logger.info('✅ Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error closing database connections:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
