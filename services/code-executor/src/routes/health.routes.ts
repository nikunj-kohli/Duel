import { Router, Request, Response } from 'express';
import { dockerExecutor } from '../executor/docker.executor';

export const healthRouter = Router();

/**
 * GET /api/health
 * Basic health check
 */
healthRouter.get('/', async (req: Request, res: Response) => {
  const dockerHealthy = await dockerExecutor.healthCheck();
  
  const health = {
    status: dockerHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'code-executor',
    version: '0.1.0',
    checks: {
      docker: dockerHealthy,
    }
  };

  const statusCode = dockerHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes
 */
healthRouter.get('/ready', async (req: Request, res: Response) => {
  const dockerHealthy = await dockerExecutor.healthCheck();
  
  if (dockerHealthy) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Docker unavailable' });
  }
});

/**
 * GET /api/health/live
 * Liveness probe for Kubernetes
 */
healthRouter.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});
