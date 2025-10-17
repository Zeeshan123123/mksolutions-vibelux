/**
 * Autodesk Forge Upload API Routes
 * Handle CAD file uploads and model conversion
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const uploadSchema = z.object({
  designId: z.string(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  contentType: z.string(),
  description: z.string().optional()
});

// POST /api/forge/upload - Upload CAD file and initiate conversion
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const designId = formData.get('designId') as string;
    const description = formData.get('description') as string;

    if (!file || !designId) {
      return NextResponse.json(
        { error: 'File and designId are required' },
        { status: 400 }
      );
    }

    // Verify design ownership
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

    // Check file type
    const supportedTypes = [
      'application/acad', // DWG
      'application/x-dwg',
      'image/vnd.dwg',
      'application/dwg',
      'model/iges', // IGES
      'application/iges',
      'model/step', // STEP
      'application/step',
      'model/x3d+xml', // X3D
      'model/obj', // OBJ
      'model/fbx', // FBX
      'model/3mf' // 3MF
    ];

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported formats: DWG, IGES, STEP, OBJ, FBX, 3MF' },
        { status: 400 }
      );
    }

    // Get Autodesk access token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/autodesk/auth`, {
      method: 'POST'
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Autodesk' },
        { status: 500 }
      );
    }

    const { access_token } = await authResponse.json();

    // Create bucket if it doesn't exist
    const bucketKey = `vibelux-${userId.toLowerCase()}`;
    await createBucketIfNotExists(access_token, bucketKey);

    // Upload file to Forge
    const objectKey = `${designId}/${Date.now()}-${file.name}`;
    const uploadResult = await uploadToForge(access_token, bucketKey, objectKey, file);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Failed to upload file to Autodesk Forge' },
        { status: 500 }
      );
    }

    // Start model derivative translation
    const urn = Buffer.from(uploadResult.objectId).toString('base64').replace(/=/g, '');
    const translationResult = await startTranslation(access_token, urn);

    if (!translationResult.success) {
      return NextResponse.json(
        { error: 'Failed to start model translation' },
        { status: 500 }
      );
    }

    // Update design with Forge data
    const updatedDesign = await prisma.greenhouseDesign.update({
      where: { id: designId },
      data: {
        forgeUrn: urn,
        forgeBucketKey: bucketKey,
        forgeObjectKey: objectKey,
        designData: {
          ...(design.designData && typeof design.designData === 'object' ? design.designData : {}),
          forge: {
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
            uploadedAt: new Date().toISOString(),
            translationStatus: 'IN_PROGRESS'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      urn,
      designId,
      fileName: file.name,
      translationStatus: 'IN_PROGRESS',
      design: updatedDesign
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/forge/upload error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Helper function to create bucket if it doesn't exist
async function createBucketIfNotExists(accessToken: string, bucketKey: string) {
  try {
    // Check if bucket exists
    const checkResponse = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (checkResponse.status === 404) {
      // Create bucket
      const createResponse = await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketKey,
          policyKey: 'temporary' // Files will be deleted after 24 hours
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create bucket');
      }
    }
  } catch (error) {
    console.error('Error managing bucket:', error);
    throw error;
  }
}

// Helper function to upload file to Forge
async function uploadToForge(accessToken: string, bucketKey: string, objectKey: string, file: File) {
  try {
    const fileBuffer = await file.arrayBuffer();

    const response = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.byteLength.toString()
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Forge upload error:', error);
      return { success: false, error };
    }

    const result = await response.json();
    return {
      success: true,
      objectId: result.objectId,
      bucketKey: result.bucketKey,
      objectKey: result.objectKey
    };

  } catch (error) {
    console.error('Error uploading to Forge:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to start model derivative translation
async function startTranslation(accessToken: string, urn: string) {
  try {
    const response = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-ads-force': 'true'
      },
      body: JSON.stringify({
        input: {
          urn: urn
        },
        output: {
          formats: [
            {
              type: 'svf2',
              views: ['2d', '3d']
            },
            {
              type: 'thumbnail',
              width: 400,
              height: 400
            }
          ]
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Translation start error:', error);
      return { success: false, error };
    }

    const result = await response.json();
    return {
      success: true,
      result
    };

  } catch (error) {
    console.error('Error starting translation:', error);
    return { success: false, error: error.message };
  }
}