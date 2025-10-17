import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { DocumentAnalysisService } from '@/services/document-analysis.service';
export const dynamic = 'force-dynamic'

const documentAnalysisService = new DocumentAnalysisService();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const documentType = searchParams.get('documentType');
    const searchText = searchParams.get('searchText');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tags = searchParams.get('tags');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Build filters
    const filters: any = {};
    
    if (documentType) filters.documentType = documentType;
    if (searchText) filters.searchText = searchText;
    if (status) filters.status = status;
    if (tags) filters.tags = tags.split(',').map(tag => tag.trim());
    
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    // Search documents
    const documents = await documentAnalysisService.searchDocuments(facilityId, filters);
    
    // Apply pagination
    const paginatedDocuments = documents.slice(offset, offset + limit);
    const hasMore = offset + limit < documents.length;

    logger.info('api', 'Document search performed', {
      facilityId,
      filters,
      resultsCount: documents.length,
      paginatedCount: paginatedDocuments.length,
      requestedBy: userId
    });

    return NextResponse.json({
      success: true,
      documents: paginatedDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        confidence: doc.confidence,
        timestamp: doc.timestamp,
        processingTime: doc.processingTime,
        structuredData: doc.structuredData,
        metadata: {
          pageCount: doc.metadata.pageCount,
          fileSize: doc.metadata.fileSize,
          imageFormat: doc.metadata.imageFormat
        },
        errors: doc.errors,
        preview: doc.extractedText.substring(0, 200) + (doc.extractedText.length > 200 ? '...' : '')
      })),
      pagination: {
        total: documents.length,
        limit,
        offset,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(documents.length / limit)
      },
      facets: {
        documentTypes: this.getDocumentTypeFacets(documents),
        confidenceRanges: this.getConfidenceFacets(documents),
        processingStatus: this.getStatusFacets(documents)
      }
    });

  } catch (error) {
    logger.error('api', 'Document search failed', error as Error);
    return NextResponse.json(
      { error: 'Document search failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, facilityId, query } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'advanced_search':
        const {
          documentTypes = [],
          keywords = [],
          dateRange,
          confidenceRange,
          hasErrors,
          extractedFields = {},
          sortBy = 'timestamp',
          sortOrder = 'desc'
        } = query;

        // Build advanced filters
        const advancedFilters: any = {};
        
        if (documentTypes.length) advancedFilters.documentTypes = documentTypes;
        if (dateRange) advancedFilters.dateRange = {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        };

        // Perform advanced search
        const advancedResults = await documentAnalysisService.searchDocuments(facilityId, advancedFilters);
        
        // Apply additional filters
        let filteredResults = advancedResults;
        
        if (keywords.length) {
          filteredResults = filteredResults.filter(doc => 
            keywords.some(keyword => 
              doc.extractedText.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        }

        if (confidenceRange) {
          filteredResults = filteredResults.filter(doc => 
            doc.confidence >= confidenceRange.min && doc.confidence <= confidenceRange.max
          );
        }

        if (hasErrors !== undefined) {
          filteredResults = filteredResults.filter(doc => 
            hasErrors ? doc.errors.length > 0 : doc.errors.length === 0
          );
        }

        // Apply extracted field filters
        Object.entries(extractedFields).forEach(([field, value]) => {
          if (value) {
            filteredResults = filteredResults.filter(doc => {
              const fieldValue = doc.structuredData[field];
              if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase().includes((value as string).toLowerCase());
              }
              return fieldValue === value;
            });
          }
        });

        // Sort results
        filteredResults.sort((a, b) => {
          let aValue = a[sortBy as keyof typeof a];
          let bValue = b[sortBy as keyof typeof b];
          
          if (sortBy === 'timestamp') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }
          
          if (sortOrder === 'desc') {
            return (bValue as number) - (aValue as number);
          }
          return (aValue as number) - (bValue as number);
        });

        logger.info('api', 'Advanced search performed', {
          facilityId,
          query,
          resultsCount: filteredResults.length,
          requestedBy: userId
        });

        return NextResponse.json({
          success: true,
          results: filteredResults,
          query,
          resultCount: filteredResults.length,
          executionTime: Date.now() % 1000 // Mock execution time
        });

      case 'save_search':
        const { searchName, searchQuery, notifications } = body;
        
        if (!searchName || !searchQuery) {
          return NextResponse.json(
            { error: 'searchName and searchQuery are required' },
            { status: 400 }
          );
        }

        const savedSearchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store saved search (in production, this would go to database)
        logger.info('api', 'Search saved', {
          searchId: savedSearchId,
          searchName,
          facilityId,
          notifications,
          savedBy: userId
        });

        return NextResponse.json({
          success: true,
          searchId: savedSearchId,
          message: 'Search saved successfully',
          notifications: notifications || false
        });

      case 'export_results':
        const { format = 'csv', documentIds, includeContent = false } = body;
        
        if (!documentIds || !Array.isArray(documentIds)) {
          return NextResponse.json(
            { error: 'documentIds array is required' },
            { status: 400 }
          );
        }

        const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate export (mock implementation)
        logger.info('api', 'Export requested', {
          exportId,
          format,
          documentCount: documentIds.length,
          includeContent,
          requestedBy: userId
        });

        return NextResponse.json({
          success: true,
          exportId,
          format,
          documentCount: documentIds.length,
          estimatedSize: `${Math.ceil(documentIds.length * 0.5)} MB`,
          downloadUrl: `/api/documents/export/${exportId}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          message: 'Export generation started'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: advanced_search, save_search, export_results' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Search action failed', error as Error);
    return NextResponse.json(
      { error: 'Search action failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper methods for facet generation
function getDocumentTypeFacets(documents: any[]): Record<string, number> {
  const facets: Record<string, number> = {};
  documents.forEach(doc => {
    facets[doc.documentType] = (facets[doc.documentType] || 0) + 1;
  });
  return facets;
}

function getConfidenceFacets(documents: any[]): Record<string, number> {
  const ranges = {
    'high (90-100%)': 0,
    'medium (70-89%)': 0,
    'low (50-69%)': 0,
    'very_low (<50%)': 0
  };

  documents.forEach(doc => {
    const confidence = doc.confidence * 100;
    if (confidence >= 90) ranges['high (90-100%)']++;
    else if (confidence >= 70) ranges['medium (70-89%)']++;
    else if (confidence >= 50) ranges['low (50-69%)']++;
    else ranges['very_low (<50%)']++;
  });

  return ranges;
}

function getStatusFacets(documents: any[]): Record<string, number> {
  const facets = {
    'no_errors': 0,
    'has_errors': 0,
    'needs_review': 0
  };

  documents.forEach(doc => {
    if (doc.errors.length === 0) {
      facets.no_errors++;
    } else {
      facets.has_errors++;
    }
    
    if (doc.confidence < 0.8) {
      facets.needs_review++;
    }
  });

  return facets;
}