import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { addExecutionJob, getJobStatus } from '../queue/execution.queue';
import { ExecutionRequest } from '../executor/docker.executor';

export const executionRouter = Router();

// Validation schema
const executionSchema = Joi.object({
  language: Joi.string().valid('java', 'cpp', 'python', 'javascript').required(),
  code: Joi.string().min(1).max(50000).required(),
  input: Joi.string().max(10000).optional().allow(''),
  timeLimit: Joi.number().min(1000).max(30000).optional(),
  memoryLimit: Joi.number().min(16).max(512).optional(),
});

/**
 * POST /api/execute
 * Submit code for execution
 */
executionRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const { error, value } = executionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const request: ExecutionRequest = value;

    // Execute directly without queue (Redis not required)
    const { dockerExecutor } = await import('../executor/docker.executor');
    const result = await dockerExecutor.execute(request);

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execute/async
 * Submit code for asynchronous execution
 * Returns job ID immediately
 */
executionRouter.post('/async', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const { error, value } = executionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const request: ExecutionRequest = value;

    // Add to queue
    const job = await addExecutionJob(request);

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      statusUrl: `/api/execute/status/${job.id}`
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/execute/status/:jobId
 * Check execution status
 */
executionRouter.get('/status/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    const status = await getJobStatus(jobId);
    if (!status) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(status);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/execute/languages
 * Get supported languages
 */
executionRouter.get('/languages', (req: Request, res: Response) => {
  const languages = [
    {
      id: 'java',
      name: 'Java',
      version: '17',
      template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
    },
    {
      id: 'cpp',
      name: 'C++',
      version: '17',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
    },
    {
      id: 'python',
      name: 'Python',
      version: '3.11',
      template: 'print("Hello, World!")'
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      version: 'Node.js 18',
      template: 'console.log("Hello, World!");'
    }
  ];

  res.status(200).json({ languages });
});
