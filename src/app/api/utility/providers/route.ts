/**
 * API Route: List Utility Providers
 * Returns available utility providers for a given region
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'
import { UtilityAPIManager } from '@/lib/utility-integration/utility-api-manager';
import { UtilityAPIConnector } from '@/lib/utility-integration/connectors/utilityapi-connector';

// Supported providers by region
const PROVIDERS_BY_REGION: Record<string, Array<{
  id: string;
  name: string;
  type: string;
  connectionMethods: string[];
  coverage: string[];
}>> = {
  'CA': [
    {
      id: 'pge',
      name: 'Pacific Gas & Electric (PG&E)',
      type: 'electric',
      connectionMethods: ['oauth', 'utilityapi'],
      coverage: ['Northern California', 'Central California']
    },
    {
      id: 'sce',
      name: 'Southern California Edison (SCE)',
      type: 'electric',
      connectionMethods: ['oauth', 'utilityapi'],
      coverage: ['Southern California', 'Los Angeles', 'Orange County']
    },
    {
      id: 'sdge',
      name: 'San Diego Gas & Electric (SDG&E)',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['San Diego County', 'Southern Orange County']
    },
    {
      id: 'ladwp',
      name: 'Los Angeles Department of Water and Power',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['Los Angeles']
    }
  ],
  'NY': [
    {
      id: 'coned',
      name: 'Consolidated Edison (ConEd)',
      type: 'electric',
      connectionMethods: ['oauth', 'utilityapi'],
      coverage: ['New York City', 'Westchester County']
    },
    {
      id: 'nationalgrid',
      name: 'National Grid',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['Upstate New York', 'Long Island']
    }
  ],
  'TX': [
    {
      id: 'oncor',
      name: 'Oncor Electric Delivery',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['Dallas', 'Fort Worth', 'North Texas']
    },
    {
      id: 'centerpoint',
      name: 'CenterPoint Energy',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['Houston', 'Southeast Texas']
    }
  ],
  'FL': [
    {
      id: 'fpl',
      name: 'Florida Power & Light (FPL)',
      type: 'electric',
      connectionMethods: ['utilityapi'],
      coverage: ['Miami-Dade', 'Broward', 'Palm Beach']
    },
    {
      id: 'duke-fl',
      name: 'Duke Energy Florida',
      type: 'electric',
      connectionMethods: ['oauth', 'utilityapi'],
      coverage: ['Central Florida', 'Tampa Bay']
    }
  ]
};

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
    const state = searchParams.get('state');
    const zipCode = searchParams.get('zipCode');
    const allProviders = searchParams.get('all') === 'true';

    if (allProviders) {
      // Return all providers
      const utilityManager = new UtilityAPIManager();
      const providers = utilityManager.getAllProviders();

      return NextResponse.json({
        providers: providers.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          region: p.region,
          apiType: p.apiType,
          connectionMethods: getConnectionMethods(p.apiType)
        }))
      });
    }

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter required' },
        { status: 400 }
      );
    }

    // Get providers for the specified state
    const stateProviders = PROVIDERS_BY_REGION[state] || [];

    // If zipCode provided, could do more specific filtering
    // For now, return all providers for the state

    // Also check UtilityAPI for additional providers
    if (process.env.UTILITYAPI_KEY) {
      try {
        const connector = new UtilityAPIConnector({
          apiKey: process.env.UTILITYAPI_KEY
        });

        const utilityApiProviders = await connector.listSupportedUtilities();

        // Merge with known providers
        utilityApiProviders.forEach(uap => {
          const existing = stateProviders.find(p =>
            p.name.toLowerCase().includes(uap.name.toLowerCase())
          );

          if (!existing && uap.type === 'electric') {
            stateProviders.push({
              id: uap.id,
              name: uap.name,
              type: uap.type,
              connectionMethods: ['utilityapi'],
              coverage: [state]
            });
          }
        });
      } catch (error) {
        logger.error('api', 'Error fetching UtilityAPI providers:', error );
      }
    }

    return NextResponse.json({
      state,
      providers: stateProviders
    });

  } catch (error) {
    logger.error('api', 'Get providers error:', error );
    return NextResponse.json(
      { error: 'Failed to retrieve providers' },
      { status: 500 }
    );
  }
}

function getConnectionMethods(apiType: string): string[] {
  switch (apiType) {
    case 'greenbutton':
      return ['oauth'];
    case 'utilityapi':
      return ['utilityapi'];
    case 'proprietary':
      return ['oauth', 'credentials'];
    default:
      return ['credentials'];
  }
}