// Test setup file
// Runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'propmanager_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test';

// Increase timeout for database operations
jest.setTimeout(10000);
