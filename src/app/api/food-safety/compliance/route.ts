import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { FoodSafetyComplianceService } from '@/lib/food-safety/compliance-service';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const action = searchParams.get('action');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    const complianceService = new FoodSafetyComplianceService();

    switch (action) {
      case 'dashboard':
        const dashboardData = await complianceService.getComplianceDashboard(facilityId);
        return NextResponse.json(dashboardData);

      case 'monitor-ccps':
        const ccpStatus = await complianceService.monitorCCPs(facilityId);
        return NextResponse.json(ccpStatus);

      case 'profiles':
        // Mock compliance profiles since model doesn't exist yet
        const profiles = [{
          id: '1',
          facilityId,
          name: 'Basic Food Safety',
          requirements: [],
          certifications: []
        }];
        return NextResponse.json(profiles);

      case 'haccp':
        // Mock HACCP plan since model doesn't exist yet
        const haccp = {
          id: '1',
          facilityId,
          status: 'approved',
          version: '1.0',
          lastUpdated: new Date()
        };
        return NextResponse.json(haccp);

      case 'alerts':
        // Mock compliance alerts since model doesn't exist yet
        const alerts = [{
          id: '1',
          facilityId,
          type: 'temperature_deviation',
          severity: 'medium',
          resolved: false
        }];
        return NextResponse.json(alerts);

      default:
        return NextResponse.json(
          { error: 'Invalid query type' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('api', 'Error in food safety compliance API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
