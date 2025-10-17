import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Middleware to ensure database connections are properly managed in serverless
export async function withDatabase(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Ensure connection is established
    await prisma.$connect()
    
    // Execute the handler
    const response = await handler(request)
    
    // In serverless environments, disconnect after each request
    if (process.env.VERCEL || process.env.NETLIFY) {
      await prisma.$disconnect()
    }
    
    return response
  } catch (error) {
    // Ensure disconnection on error
    if (process.env.VERCEL || process.env.NETLIFY) {
      await prisma.$disconnect()
    }
    
    throw error
  }
}

// Higher-order function for API routes
export function withDatabaseRoute<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      // Ensure connection
      await prisma.$connect()
      
      // Execute handler
      const result = await handler(...args)
      
      // Disconnect in serverless
      if (process.env.VERCEL || process.env.NETLIFY) {
        await prisma.$disconnect()
      }
      
      return result
    } catch (error) {
      // Ensure disconnection on error
      if (process.env.VERCEL || process.env.NETLIFY) {
        await prisma.$disconnect()
      }
      
      throw error
    }
  }) as T
}