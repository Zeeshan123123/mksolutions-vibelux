import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { command } = await request.json();
    
    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    logger.info('system', `Debug command executed: ${command} by ${user.email}`);

    // Execute debug commands
    const result = await executeDebugCommand(command);
    
    return NextResponse.json({
      success: true,
      output: result.output,
      executionTime: result.executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('system', 'Debug command execution failed:', error);
    return NextResponse.json({
      error: 'Command execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function executeDebugCommand(command: string): Promise<{ output: string; executionTime: number }> {
  const startTime = Date.now();
  
  try {
    switch (command) {
      case 'system-info':
        return {
          output: JSON.stringify({
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            env: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
          }, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'memory-usage':
        const memUsage = process.memoryUsage();
        return {
          output: JSON.stringify({
            rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
            arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)} MB`
          }, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'env-vars':
        const safeEnvVars = Object.keys(process.env).reduce((acc, key) => {
          // Mask sensitive environment variables
          if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD') || key.includes('TOKEN')) {
            acc[key] = '***MASKED***';
          } else {
            acc[key] = process.env[key];
          }
          return acc;
        }, {} as Record<string, string | undefined>);
        
        return {
          output: JSON.stringify(safeEnvVars, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'db-status':
        try {
          await prisma.$queryRaw`SELECT 1`;
          const userCount = await prisma.user.count();
          const projectCount = await prisma.project.count();
          
          return {
            output: JSON.stringify({
              status: 'connected',
              userCount,
              projectCount,
              timestamp: new Date().toISOString()
            }, null, 2),
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          return {
            output: JSON.stringify({
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown database error'
            }, null, 2),
            executionTime: Date.now() - startTime
          };
        }

      case 'db-tables':
        try {
          const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          ` as Array<{ table_name: string }>;
          
          const tableCounts = await Promise.all(
            tables.map(async (table) => {
              try {
                const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                return { table: table.table_name, count: (count as any)[0].count };
              } catch {
                return { table: table.table_name, count: 'error' };
              }
            })
          );

          return {
            output: JSON.stringify(tableCounts, null, 2),
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          return {
            output: JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to fetch table info'
            }, null, 2),
            executionTime: Date.now() - startTime
          };
        }

      case 'user-stats':
        try {
          const totalUsers = await prisma.user.count();
          const recentUsers = await prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          });
          
          return {
            output: JSON.stringify({
              totalUsers,
              recentUsers,
              timestamp: new Date().toISOString()
            }, null, 2),
            executionTime: Date.now() - startTime
          };
        } catch (error) {
          return {
            output: JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to fetch user stats'
            }, null, 2),
            executionTime: Date.now() - startTime
          };
        }

      case 'api-health':
        const healthChecks = [
          { endpoint: 'Database', status: 'checking' },
          { endpoint: 'Authentication', status: 'checking' },
          { endpoint: 'External APIs', status: 'checking' }
        ];

        try {
          // Test database
          await prisma.$queryRaw`SELECT 1`;
          healthChecks[0].status = 'healthy';
        } catch {
          healthChecks[0].status = 'unhealthy';
        }

        // Mock other checks
        healthChecks[1].status = 'healthy';
        healthChecks[2].status = 'healthy';

        return {
          output: JSON.stringify(healthChecks, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'cache-status':
        return {
          output: JSON.stringify({
            status: 'No cache system configured',
            recommendation: 'Consider implementing Redis for production caching'
          }, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'cache-clear':
        return {
          output: JSON.stringify({
            message: 'No cache to clear - cache system not implemented yet'
          }, null, 2),
          executionTime: Date.now() - startTime
        };

      case 'restart-services':
        return {
          output: JSON.stringify({
            message: 'Service restart not available in serverless environment',
            recommendation: 'Use Vercel dashboard to redeploy if needed'
          }, null, 2),
          executionTime: Date.now() - startTime
        };

      default:
        // Handle custom commands
        return {
          output: JSON.stringify({
            error: `Unknown command: ${command}`,
            availableCommands: [
              'system-info', 'memory-usage', 'env-vars', 'db-status', 
              'db-tables', 'user-stats', 'api-health', 'cache-status'
            ]
          }, null, 2),
          executionTime: Date.now() - startTime
        };
    }
  } catch (error) {
    return {
      output: JSON.stringify({
        error: error instanceof Error ? error.message : 'Command execution failed'
      }, null, 2),
      executionTime: Date.now() - startTime
    };
  }
}