import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';
import { config, Language } from '../config';

const logger = createLogger('DockerExecutor');

// Initialize Docker - let dockerode auto-detect on Windows
const docker = new Docker();

export interface ExecutionRequest {
  language: Language;
  code: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface ExecutionResult {
  submissionId: string;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'memory_exceeded';
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  exitCode?: number;
}

export class DockerExecutor {
  
  /**
   * Execute code in isolated Docker container
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const submissionId = uuidv4();
    const startTime = Date.now();

    logger.info(`Starting execution ${submissionId}`, {
      language: request.language,
      codeLength: request.code.length
    });

    try {
      // Validate language
      const langConfig = config.languages[request.language];
      if (!langConfig) {
        throw new Error(`Unsupported language: ${request.language}`);
      }

      // Create container with resource limits
      const container = await this.createContainer(request, langConfig, submissionId);

      try {
        // Start container
        await container.start();
        logger.info(`Container started: ${submissionId}`);

        // Wait for execution with timeout
        const timeLimit = Math.min(
          request.timeLimit || config.execution.defaultTimeout,
          config.execution.maxTimeout
        );

        const result = await this.waitForExecution(container, timeLimit);
        
        // Get logs
        const logs = await this.getContainerLogs(container);
        
        // Calculate execution time
        const executionTime = Date.now() - startTime;

        // Inspect container for stats
        const inspection = await container.inspect();
        const exitCode = inspection.State.ExitCode;

        logger.info(`Execution completed: ${submissionId}`, {
          exitCode,
          executionTime
        });

        // Determine status
        let status: ExecutionResult['status'] = 'success';
        if (exitCode !== 0) {
          status = 'runtime_error';
        }

        return {
          submissionId,
          status,
          output: logs.stdout,
          error: logs.stderr,
          executionTime,
          exitCode
        };

      } finally {
        // Always cleanup container
        await this.cleanupContainer(container, submissionId);
      }

    } catch (error: any) {
      logger.error(`Execution failed: ${submissionId}`, error);
      
      // Determine error type
      let status: ExecutionResult['status'] = 'runtime_error';
      if (error.message?.includes('timeout')) {
        status = 'timeout';
      } else if (error.message?.includes('memory')) {
        status = 'memory_exceeded';
      }

      return {
        submissionId,
        status,
        error: error.message || 'Unknown error occurred',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Create container with code and resource limits
   */
  private async createContainer(
    request: ExecutionRequest,
    langConfig: any,
    submissionId: string
  ): Promise<Docker.Container> {
    const memoryLimit = Math.min(
      request.memoryLimit || config.execution.defaultMemoryLimit,
      config.execution.maxMemoryLimit
    );

    // Prepare code file
    const fileName = request.language === 'java' ? 'Main.java' : `main${langConfig.fileExtension}`;
    const code = Buffer.from(request.code).toString('base64');
    
    // Build execution command
    let cmd: string[];
    if (langConfig.compileCommand) {
      // Compiled language: compile then execute
      if (request.input) {
        const inputBase64 = Buffer.from(request.input).toString('base64');
        cmd = [
          'sh', '-c',
          `echo "${code}" | base64 -d > ${fileName} && ${langConfig.compileCommand} && echo "${inputBase64}" | base64 -d | ${langConfig.executeCommand}`
        ];
      } else {
        cmd = [
          'sh', '-c',
          `echo "${code}" | base64 -d > ${fileName} && ${langConfig.compileCommand} && ${langConfig.executeCommand}`
        ];
      }
    } else {
      // Interpreted language: execute directly
      if (request.input) {
        const inputBase64 = Buffer.from(request.input).toString('base64');
        cmd = [
          'sh', '-c',
          `echo "${code}" | base64 -d > ${fileName} && echo "${inputBase64}" | base64 -d | ${langConfig.executeCommand}`
        ];
      } else {
        cmd = [
          'sh', '-c',
          `echo "${code}" | base64 -d > ${fileName} && ${langConfig.executeCommand}`
        ];
      }
    }

    const containerConfig: Docker.ContainerCreateOptions = {
      Image: langConfig.image,
      Cmd: cmd,
      name: `logic-arena-exec-${submissionId}`,
      HostConfig: {
        Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
        MemorySwap: memoryLimit * 1024 * 1024, // Prevent swap
        NanoCpus: config.execution.defaultCpuLimit * 1e9, // Convert to nanocpus
        NetworkMode: 'none', // No network access
        PidsLimit: 50, // Limit number of processes (prevent fork bombs)
        ReadonlyRootfs: false, // Need write for compilation
        AutoRemove: false, // We'll remove manually
      },
      AttachStdout: true,
      AttachStderr: true,
    };

    // Pull image if not exists
    await this.ensureImageExists(langConfig.image);

    return docker.createContainer(containerConfig);
  }

  /**
   * Wait for container execution with timeout
   */
  private async waitForExecution(
    container: Docker.Container,
    timeLimit: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        container.kill().catch(() => {}); // Kill container on timeout
        reject(new Error('Execution timeout exceeded'));
      }, timeLimit);

      container.wait((err, data) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get container stdout and stderr
   */
  private async getContainerLogs(container: Docker.Container): Promise<{
    stdout: string;
    stderr: string;
  }> {
    const logStream = await container.logs({
      stdout: true,
      stderr: true,
      follow: false
    });

    // Parse Docker multiplexed stream
    let stdout = '';
    let stderr = '';

    const chunks = logStream.toString().split('\n');
    for (const chunk of chunks) {
      if (chunk.length > 8) {
        // Docker multiplexed stream format: [STREAM_TYPE][SIZE][DATA]
        const streamType = chunk.charCodeAt(0);
        const data = chunk.substring(8);
        
        if (streamType === 1) {
          stdout += data + '\n';
        } else if (streamType === 2) {
          stderr += data + '\n';
        }
      }
    }

    return { 
      stdout: stdout.trim(), 
      stderr: stderr.trim() 
    };
  }

  /**
   * Cleanup container after execution
   */
  private async cleanupContainer(
    container: Docker.Container,
    submissionId: string
  ): Promise<void> {
    try {
      // Stop container if still running
      await container.stop({ t: 1 }).catch(() => {}); // Ignore if already stopped
      
      // Remove container
      await container.remove({ force: true });
      
      logger.info(`Container cleaned up: ${submissionId}`);
    } catch (error) {
      logger.error(`Failed to cleanup container: ${submissionId}`, error);
    }
  }

  /**
   * Ensure Docker image exists (pull if needed)
   */
  private async ensureImageExists(image: string): Promise<void> {
    try {
      await docker.getImage(image).inspect();
      logger.debug(`Image exists: ${image}`);
    } catch (error) {
      logger.info(`Pulling image: ${image}`);
      await new Promise<void>((resolve, reject) => {
        docker.pull(image, (err: any, stream: any) => {
          if (err) {
            reject(err);
            return;
          }
          docker.modem.followProgress(stream, (err: any) => {
            if (err) {
              reject(err);
            } else {
              logger.info(`Image pulled successfully: ${image}`);
              resolve();
            }
          });
        });
      });
    }
  }

  /**
   * Health check: verify Docker daemon is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      await docker.ping();
      return true;
    } catch (error) {
      logger.error('Docker health check failed', error);
      return false;
    }
  }
}

export const dockerExecutor = new DockerExecutor();
