import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from './utils/logger';
import { executionRouter } from './routes/execution.routes';
import { healthRouter } from './routes/health.routes';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { initializeQueue } from './queue/execution.queue';
import { testDatabaseConnection } from './database';
import { testSupabaseConnection } from './database/supabase';
import { config } from './config';
import { initializeSocketIO } from './routes/socket.routes';

const logger = createLogger('Server');

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true
  }));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next();
  });

  // Routes
  app.use('/api/health', healthRouter);
  app.use('/api/execute', executionRouter);
  app.use('/api/users', userRouter);

  // Error handling
  app.use(errorHandler);

  // Test database connections (optional - won't fail if DB not configured)
  if (config.database.url) {
    await testDatabaseConnection();
  } else {
    logger.warn('PostgreSQL not configured - submissions will not be saved');
  }

  // Test Supabase connection
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    await testSupabaseConnection();
  } else {
    logger.warn('Supabase not configured - user features will not work');
  }

  // Initialize queue workers (optional - skip if Redis not available)
  try {
    await initializeQueue();
  } catch (error: any) {
    logger.warn('Queue initialization failed - executing code directly without queue', { error: error.message });
  }

  // Initialize Socket.IO
  initializeSocketIO(httpServer);
  logger.info('Socket.IO initialized');

  // Start server
  const PORT = config.server.port;
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Code Executor Service running on port ${PORT}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`Docker Host: ${config.docker.host}`);
    logger.info(`Socket.IO enabled for real-time collaboration`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
