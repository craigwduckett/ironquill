import type { FastifyPluginAsync } from 'fastify';
import * as dashboardService from '../../services/dashboard.js';

const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.authenticate] }, async (request) => {
    return dashboardService.getDashboard(request.user.sub);
  });
};

export default dashboardRoutes;
