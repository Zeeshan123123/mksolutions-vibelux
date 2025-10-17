// Main Prisma client with connection pooling
// This file re-exports from the new database module for backward compatibility

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Use client stub if in browser, otherwise use real database
export const { 
  prisma,
  performHealthCheck,
  getConnectionMetrics,
  getQueryMetrics,
  withRetry,
  Prisma
} = isClient 
  ? require('./database-client-stub')
  : require('./database')

export default prisma

// Legacy checkDatabaseHealth function for backward compatibility
export async function checkDatabaseHealth(): Promise<boolean> {
  if (isClient) {
    return true; // Always return healthy on client
  }
  const { performHealthCheck } = await import('./database')
  const { prisma } = await import('./database')
  const result = await performHealthCheck(prisma)
  return result.isHealthy
}

// Legacy connectionManager for backward compatibility
export const connectionManager = {
  get prisma() {
    return prisma
  },
  connect: async () => {
    if (!isClient) {
      await prisma.$connect()
    }
  },
  disconnect: async () => {
    if (!isClient) {
      await prisma.$disconnect()
    }
  },
  isConnected: async () => {
    return true
  },
  getConnectionCount: () => {
    return 1
  }
}