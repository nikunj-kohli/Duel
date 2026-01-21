import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },

  cors: {
    allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  database: {
    url: process.env.DATABASE_URL || '',
  },

  docker: {
    host: process.env.DOCKER_HOST || (process.platform === 'win32' ? 'npipe:////./pipe/docker_engine' : 'unix:///var/run/docker.sock'),
    socketPath: process.env.DOCKER_SOCKET_PATH || (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'),
  },

  execution: {
    // Time limits in milliseconds
    defaultTimeout: parseInt(process.env.EXECUTION_TIMEOUT || '5000', 10),
    maxTimeout: parseInt(process.env.MAX_EXECUTION_TIMEOUT || '30000', 10),
    
    // Memory limits in MB
    defaultMemoryLimit: parseInt(process.env.MEMORY_LIMIT_MB || '128', 10),
    maxMemoryLimit: parseInt(process.env.MAX_MEMORY_LIMIT_MB || '512', 10),
    
    // CPU limits (0.5 = 50% of one core)
    defaultCpuLimit: parseFloat(process.env.CPU_LIMIT || '0.5'),
    maxCpuLimit: parseFloat(process.env.MAX_CPU_LIMIT || '1.0'),

    // Container lifecycle
    containerCleanupTimeout: 10000, // 10 seconds
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '10', 10),
  },

  queue: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200, // Keep last 200 failed jobs
  },

  languages: {
    java: {
      image: 'eclipse-temurin:17-jdk-alpine',
      compileCommand: 'javac Main.java',
      executeCommand: 'java Main',
      fileExtension: '.java',
    },
    cpp: {
      image: 'gcc:13-alpine',
      compileCommand: 'g++ -o main main.cpp -std=c++17',
      executeCommand: './main',
      fileExtension: '.cpp',
    },
    python: {
      image: 'python:3.12-alpine',
      compileCommand: null, // Interpreted language
      executeCommand: 'python3 main.py',
      fileExtension: '.py',
    },
    javascript: {
      image: 'node:20-alpine',
      compileCommand: null,
      executeCommand: 'node main.js',
      fileExtension: '.js',
    },
  },
};

export type Language = keyof typeof config.languages;
