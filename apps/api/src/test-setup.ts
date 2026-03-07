// Set required environment variables before any test module is loaded.
// This runs before the first import in every test file.
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars!!';
process.env.NODE_ENV = 'test';
