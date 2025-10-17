/**
 * Autodesk Forge Viewer Token API
 * Generate viewer tokens for 3D model display
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/forge/viewer-token - Get viewer access token
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId');

    // If designId provided, verify user has access
    if (designId) {
      const design = await prisma.greenhouseDesign.findFirst({
        where: {
          id: designId,
          userId
        }
      });

      if (!design) {
        return NextResponse.json(
          { error: 'Design not found' },
          { status: 404 }
        );
      }
    }

    // Get viewer token (read-only scope)
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': process.env.AUTODESK_CLIENT_ID!,
        'client_secret': process.env.AUTODESK_CLIENT_SECRET!,
        'scope': 'viewables:read'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Forge viewer token error:', error);
      return NextResponse.json(
        { error: 'Failed to get viewer token' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('GET /api/forge/viewer-token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/forge/viewer-token - Generate token for specific design
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { designId } = await request.json();

    if (!designId) {
      return NextResponse.json(
        { error: 'designId is required' },
        { status: 400 }
      );
    }

    // Verify design ownership and get Forge data
    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: designId,
        userId
      },
      select: {
        id: true,
        name: true,
        forgeUrn: true,
        forgeBucketKey: true,
        forgeObjectKey: true,
        forgeViewToken: true,
        designData: true
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    if (!design.forgeUrn) {
      return NextResponse.json(
        { error: 'No 3D model uploaded for this design' },
        { status: 400 }
      );
    }

    // Get viewer token
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': process.env.AUTODESK_CLIENT_ID!,
        'client_secret': process.env.AUTODESK_CLIENT_SECRET!,
        'scope': 'viewables:read'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Forge viewer token error:', error);
      return NextResponse.json(
        { error: 'Failed to get viewer token' },
        { status: 500 }
      );
    }

    const tokenData = await response.json();

    // Check model derivative status
    const manifestResponse = await fetch(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${design.forgeUrn}/manifest`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    let manifestData: any = null;
    let translationStatus = 'unknown';
    
    if (manifestResponse.ok) {
      manifestData = await manifestResponse.json();
      translationStatus = manifestData?.status || 'unknown';
    }

    // Update design with latest viewer token
    await prisma.greenhouseDesign.update({
      where: { id: designId },
      data: {
        forgeViewToken: tokenData.access_token,
        designData: {
          ...(design.designData && typeof design.designData === 'object' ? design.designData : {}),
          forge: {
            ...(design.designData as any)?.forge,
            lastTokenGenerated: new Date().toISOString(),
            translationStatus
          }
        }
      }
    });

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      urn: design.forgeUrn,
      translationStatus,
      manifest: manifestData,
      design: {
        id: design.id,
        name: design.name
      }
    });

  } catch (error) {
    console.error('POST /api/forge/viewer-token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate viewer token' },
      { status: 500 }
    );
  }
}