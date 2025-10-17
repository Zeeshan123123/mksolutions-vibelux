/**
 * API Route: Sync Utility Data
 * Manually trigger or check status of utility data synchronization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { sql } from '@/lib/db';
import { UtilityAPIManager } from '@/lib/utility-integration/utility-api-manager';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, syncType = 'full' } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID required' },
        { status: 400 }
      );
    }

    // Create sync job
    const syncJobResults = await sql`
      INSERT INTO utility_sync_jobs (
        connection_id,
        job_type,
        status,
        created_at
      ) VALUES (
        ${accountId},
        ${syncType},
        'pending',
        NOW()
      )
      RETURNING id
    `;

    const syncJob = (syncJobResults as any[])[0];

    // Start sync in background
    startSyncJob(syncJob.id, accountId, syncType).catch(error => {
      logger.error('api', 'Sync job error:', new Error(error));
      updateSyncJobStatus(syncJob.id, 'failed', error.message);
    });

    return NextResponse.json({
      success: true,
      jobId: syncJob.id,
      message: 'Sync job started'
    });

  } catch (error) {
    logger.error('api', 'Sync initiation error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const accountId = searchParams.get('accountId');

    if (jobId) {
      // Get specific job status
      const jobResults = await sql`
        SELECT 
          j.*,
          c.facility_id,
          c.provider_id
        FROM utility_sync_jobs j
        JOIN utility_connections c ON j.connection_id = c.id
        WHERE j.id = ${jobId}
      `;

      const job = (jobResults as any[])[0];

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        job: {
          id: job.id,
          status: job.status,
          type: job.job_type,
          startedAt: job.started_at,
          completedAt: job.completed_at,
          recordsProcessed: job.records_processed,
          error: job.error_message,
          metadata: job.metadata
        }
      });
    }

    if (accountId) {
      // Get recent jobs for account
      const jobsResults = await sql`
        SELECT * FROM utility_sync_jobs
        WHERE connection_id = ${accountId}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const jobs = jobsResults as any[];

      return NextResponse.json({
        jobs: jobs.map(job => ({
          id: job.id,
          status: job.status,
          type: job.job_type,
          createdAt: job.created_at,
          completedAt: job.completed_at,
          recordsProcessed: job.records_processed
        }))
      });
    }

    return NextResponse.json(
      { error: 'Job ID or Account ID required' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('api', 'Get sync status error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to retrieve sync status' },
      { status: 500 }
    );
  }
}

async function startSyncJob(jobId: string, accountId: string, syncType: string) {
  // Update job status
  await sql`
    UPDATE utility_sync_jobs
    SET 
      status = 'running',
      started_at = NOW()
    WHERE id = ${jobId}
  `;

  // Get account details
  const connectionResults = await sql`
    SELECT * FROM utility_connections
    WHERE id = ${accountId}
  `;
  
  const connection = (connectionResults as any[])[0];

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Get provider details
  const utilityManager = new UtilityAPIManager();
  const provider = utilityManager.getProvider(connection.provider_id);
  
  if (!provider) {
    throw new Error('Provider not found');
  }

  // Create account object
  const account = {
    id: connection.id,
    facilityId: connection.facility_id,
    providerId: connection.provider_id,
    accountNumber: connection.account_number,
    meterNumbers: connection.meter_numbers || [],
    serviceAddress: connection.service_address,
    status: connection.connection_status,
    connectionDate: connection.created_at,
    lastSyncDate: connection.last_sync_date,
    authorizationStatus: {
      authorized: connection.connection_status === 'active',
      method: connection.connection_method as any
    }
  };

  // Perform sync
  const startTime = Date.now();
  let recordsProcessed = 0;
  
  try {
    // Sync account data
    await utilityManager['syncAccountData'](account, provider);
    
    // Get counts
    const countsResults = await sql`
      SELECT 
        (SELECT COUNT(*) FROM utility_bills WHERE connection_id = ${accountId}) as bill_count,
        (SELECT COUNT(*) FROM utility_intervals WHERE connection_id = ${accountId}) as interval_count
    `;
    
    const counts = (countsResults as any[])[0];
    
    recordsProcessed = counts.bill_count + counts.interval_count;
    
    // Update job status
    await updateSyncJobStatus(jobId, 'completed', null, {
      recordsProcessed,
      duration: Date.now() - startTime,
      billCount: counts.bill_count,
      intervalCount: counts.interval_count
    });
    
  } catch (error) {
    throw error;
  }
}

async function updateSyncJobStatus(
  jobId: string, 
  status: string, 
  error?: string | null,
  metadata?: any
) {
  await sql`
    UPDATE utility_sync_jobs
    SET 
      status = ${status},
      completed_at = ${status === 'completed' || status === 'failed' ? sql`NOW()` : null},
      error_message = ${error || null},
      records_processed = ${metadata?.recordsProcessed || 0},
      metadata = ${metadata ? JSON.stringify(metadata) : null}
    WHERE id = ${jobId}
  `;
}