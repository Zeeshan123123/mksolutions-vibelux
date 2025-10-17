/**
 * Client-side stub for database operations
 * This prevents Prisma from being imported in the browser
 */

export const prisma = {
  $connect: async () => {},
  $disconnect: async () => {},
  $queryRaw: async () => [],
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  project: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  // Add other models as needed
};

export const performHealthCheck = async () => ({
  isHealthy: true,
  responseTime: 0,
  connectionCount: 1,
  database: {
    activeConnections: 1,
    totalQueries: 0,
    averageQueryTime: 0
  }
});

export const getConnectionMetrics = () => ({
  activeConnections: 1,
  idleConnections: 0,
  totalConnections: 1,
  waitingConnections: 0
});

export const getQueryMetrics = () => ({
  totalQueries: 0,
  averageQueryTime: 0,
  slowQueries: 0,
  failedQueries: 0
});

export const withRetry = async (fn: Function) => fn();

export const Prisma = {
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
  PrismaClientUnknownRequestError: class PrismaClientUnknownRequestError extends Error {},
  PrismaClientRustPanicError: class PrismaClientRustPanicError extends Error {},
  PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
  PrismaClientValidationError: class PrismaClientValidationError extends Error {},
};