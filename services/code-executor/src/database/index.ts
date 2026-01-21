import { Pool } from 'pg';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

let pool: Pool | null = null;

export function getDatabase(): Pool {
  if (!pool) {
    if (!config.database.url) {
      logger.warn('No DATABASE_URL configured. Database features disabled.');
      throw new Error('Database not configured');
    }

    pool = new Pool({
      connectionString: config.database.url,
      ssl: {
        rejectUnauthorized: false // Supabase uses SSL
      },
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: Error) => {
      logger.error('Unexpected database error', err);
    });

    logger.info('Database connection pool created');
  }

  return pool;
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.query('SELECT NOW()');
    logger.info('Database connection successful', { time: result.rows[0].now });
    return true;
  } catch (error: any) {
    logger.error('Database connection failed', error);
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
}

// Helper to save submission to database
export async function saveSubmission(submission: {
  submissionId: string;
  userId?: number;
  problemId?: number;
  language: string;
  code: string;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  output?: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    const db = getDatabase();
    await db.query(
      `INSERT INTO submissions (
        submission_uuid, user_id, problem_id, language, code, 
        status, execution_time, memory_used, output, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        submission.submissionId,
        submission.userId || null,
        submission.problemId || null,
        submission.language,
        submission.code,
        submission.status,
        submission.executionTime || null,
        submission.memoryUsed || null,
        submission.output || null,
        submission.errorMessage || null,
      ]
    );
    logger.info('Submission saved to database', { submissionId: submission.submissionId });
  } catch (error: any) {
    logger.error('Failed to save submission', error);
    // Don't throw - we don't want to fail the submission if DB is down
  }
}
