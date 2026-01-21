import Queue from 'bull';
import { config } from '../config';
import { dockerExecutor, ExecutionRequest } from '../executor/docker.executor';
import { createLogger } from '../utils/logger';

const logger = createLogger('ExecutionQueue');

export const executionQueue = new Queue('code-execution', config.redis.url, {
  defaultJobOptions: {
    attempts: config.queue.attempts,
    backoff: config.queue.backoff,
    removeOnComplete: config.queue.removeOnComplete,
    removeOnFail: config.queue.removeOnFail,
  },
});

export async function initializeQueue() {
  // Process jobs with concurrency limit
  executionQueue.process(config.execution.maxConcurrentExecutions, async (job) => {
    const { data } = job;
    logger.info(`Processing job ${job.id}`, { language: data.language });

    try {
      // Update progress
      await job.progress(10);

      // Execute code
      const result = await dockerExecutor.execute(data as ExecutionRequest);

      await job.progress(100);
      return result;
    } catch (error: any) {
      logger.error(`Job ${job.id} failed`, error);
      throw error;
    }
  });

  // Event listeners
  executionQueue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed`, { 
      submissionId: result.submissionId,
      status: result.status 
    });
  });

  executionQueue.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed`, err);
  });

  executionQueue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled`);
  });

  logger.info('Execution queue initialized');
}

export async function addExecutionJob(request: ExecutionRequest, priority: number = 0) {
  const job = await executionQueue.add(request, {
    priority,
    timeout: config.execution.maxTimeout + 5000, // Job timeout > execution timeout
  });

  logger.info(`Job ${job.id} added to queue`, { language: request.language });
  return job;
}

export async function getJobStatus(jobId: string) {
  const job = await executionQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  
  return {
    id: jobId,
    state,
    progress,
    data: job.data,
    result: state === 'completed' ? await job.finished() : null,
    failedReason: state === 'failed' ? job.failedReason : null,
  };
}
