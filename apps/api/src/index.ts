import 'dotenv/config';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './lib/env.js';
import authPlugin from './plugins/auth.js';
import errorHandler from './plugins/error-handler.js';
import authRoutes from './routes/auth/index.js';
import characterRoutes from './routes/characters/index.js';
import dashboardRoutes from './routes/dashboard/index.js';
import srdRoutes from './routes/srd/index.js';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Zod type provider
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// CORS
await app.register(cors, {
  origin: env.NODE_ENV === 'production' ? ['https://ironquill.app'] : ['http://localhost:5173'],
  credentials: true,
});

// Plugins
await app.register(errorHandler);
await app.register(authPlugin);

// Routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(characterRoutes, { prefix: '/characters' });
await app.register(srdRoutes, { prefix: '/srd' });
await app.register(dashboardRoutes, { prefix: '/dashboard' });

app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
