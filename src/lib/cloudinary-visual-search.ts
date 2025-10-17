import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface VisualSearchResult {
  publicId: string;
  similarity: number;
  metadata: {
    title?: string;
    price?: number;
    category?: string;
    brand?: string;
    tags?: string[];
  };
  transformedUrl: string;
  affiliateLink?: string;
}

// Create visual search index for equipment
export async function createVisualSearchIndex(category: 'equipment' | 'plants' | 'all' = 'all') {
  try {
    let searchExpression = 'folder:equipment OR folder:marketplace';
    
    if (category === 'equipment') {
      searchExpression = 'folder:equipment';
    } else if (category === 'plants') {
      searchExpression = 'folder:plant_health';
    }

    // Create search index with visual similarity
    const result = await cloudinary.api.create_search_index({
      name: `vibelux_${category}_visual_search`,
      search_expression: searchExpression,
      
      // Visual search configuration
      visual_search: {
        enabled: true,
        algorithm: 'similar_images', // or 'duplicate_detection'
        similarity_threshold: 0.7,
        max_results: 20
      },
      
      // Include metadata for filtering
      metadata_fields: ['title', 'price', 'category', 'brand', 'asin'],
      
      // Auto-tag for better search
      auto_tagging: {
        enabled: true,
        confidence_threshold: 0.6
      }
    });

    logger.info('api', 'Visual search index created:', { data: result });
    return result;
  } catch (error) {
    logger.error('api', 'Failed to create visual search index:', error );
    throw error;
  }
}

// Search for similar equipment
export async function findSimilarEquipment(
  imageUrl: string,
  options?: {
    maxResults?: number;
    category?: string;
    priceRange?: { min: number; max: number };
    includeAmazonProducts?: boolean;
  }
): Promise<VisualSearchResult[]> {
  try {
    // Upload the search image temporarily
    const searchImage = await cloudinary.uploader.upload(imageUrl, {
      folder: 'temp_search',
      tags: ['visual_search', 'temporary'],
      
      // Auto-delete after 24 hours
      type: 'upload',
      access_mode: 'public',
      async: false
    });

    // Perform visual search
    const searchResults = await cloudinary.search
      .expression(`visual_search:${searchImage.public_id}`)
      .with_field('visual_similarity_score')
      .with_field('context')
      .with_field('metadata')
      .with_field('tags')
      .max_results(options?.maxResults || 20)
      .execute();

    // Filter and process results
    let results = searchResults.resources
      .filter(resource => resource.visual_similarity_score > 0.7)
      .map(resource => {
        const metadata = resource.metadata || {};
        
        return {
          publicId: resource.public_id,
          similarity: resource.visual_similarity_score,
          metadata: {
            title: metadata.title || 'Unknown Equipment',
            price: metadata.price ? parseFloat(metadata.price) : undefined,
            category: metadata.category,
            brand: metadata.brand,
            tags: resource.tags || []
          },
          transformedUrl: cloudinary.url(resource.public_id, {
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
              { quality: 'auto:good' },
              { format: 'auto' }
            ]
          }),
          affiliateLink: metadata.asin ? 
            `https://www.amazon.com/dp/${metadata.asin}?tag=whaisurbfar-20` : 
            undefined
        };
      });

    // Apply additional filters
    if (options?.category) {
      results = results.filter(r => 
        r.metadata.category?.toLowerCase().includes(options.category!.toLowerCase())
      );
    }

    if (options?.priceRange) {
      results = results.filter(r => {
        const price = r.metadata.price;
        return price && price >= options.priceRange!.min && price <= options.priceRange!.max;
      });
    }

    // Sort by similarity score
    results.sort((a, b) => b.similarity - a.similarity);

    // Include Amazon product suggestions if requested
    if (options?.includeAmazonProducts && results.length > 0) {
      const topResult = results[0];
      const amazonSuggestions = await getAmazonSuggestions(topResult.metadata);
      
      // Merge Amazon suggestions with visual search results
      results = [...results.slice(0, 10), ...amazonSuggestions].slice(0, 15);
    }

    // Clean up temporary search image
    await cloudinary.uploader.destroy(searchImage.public_id);

    return results;
    
  } catch (error) {
    logger.error('api', 'Visual search error:', error );
    throw new Error('Failed to perform visual search');
  }
}

// Find duplicate or similar images (for marketplace moderation)
export async function findDuplicateListings(
  imageUrl: string,
  threshold: number = 0.95
): Promise<Array<{
  publicId: string;
  similarity: number;
  uploadedAt: Date;
  userId?: string;
}>> {
  try {
    const searchImage = await cloudinary.uploader.upload(imageUrl, {
      folder: 'temp_duplicate_check',
      phash: true, // Enable perceptual hash
      
      // Generate hash for comparison
      moderation: 'duplicate_detection',
      notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
    });

    // Search for duplicates using phash
    const duplicates = await cloudinary.search
      .expression(`phash:${searchImage.phash}`)
      .with_field('phash_distance')
      .with_field('created_at')
      .with_field('context')
      .max_results(10)
      .execute();

    const results = duplicates.resources
      .filter(resource => {
        // Calculate similarity from phash distance
        const distance = resource.phash_distance || 0;
        const similarity = 1 - (distance / 100);
        return similarity >= threshold;
      })
      .map(resource => ({
        publicId: resource.public_id,
        similarity: 1 - ((resource.phash_distance || 0) / 100),
        uploadedAt: new Date(resource.created_at),
        userId: resource.context?.userId
      }));

    // Clean up
    await cloudinary.uploader.destroy(searchImage.public_id);

    return results;
    
  } catch (error) {
    logger.error('api', 'Duplicate detection error:', error );
    throw error;
  }
}

// Visual search for plant diseases
export async function findSimilarPlantIssues(
  plantImageUrl: string,
  issueType?: 'disease' | 'pest' | 'nutrient'
): Promise<Array<{
  issue: string;
  similarity: number;
  description: string;
  treatment: string;
  referenceImage: string;
}>> {
  try {
    // This would connect to a plant disease database
    // For now, we'll use Cloudinary's visual search with pre-indexed disease images
    
    const searchResults = await findSimilarEquipment(plantImageUrl, {
      category: `plant_${issueType || 'issue'}`,
      maxResults: 10
    });

    // Transform results into plant issue format
    return searchResults.map(result => ({
      issue: result.metadata.title || 'Unknown Issue',
      similarity: result.similarity,
      description: result.metadata.tags?.join(', ') || '',
      treatment: getTreatmentRecommendation(result.metadata.title || ''),
      referenceImage: result.transformedUrl
    }));
    
  } catch (error) {
    logger.error('api', 'Plant issue search error:', error );
    return [];
  }
}

// Helper function to get Amazon product suggestions
async function getAmazonSuggestions(metadata: any): Promise<VisualSearchResult[]> {
  // This would connect to Amazon Product API
  // For now, return mock suggestions based on category
  
  const suggestions = [];
  
  if (metadata.category === 'grow_light') {
    suggestions.push({
      publicId: 'amazon_suggestion_1',
      similarity: 0.85,
      metadata: {
        title: 'Similar LED Grow Light on Amazon',
        price: 299.99,
        category: 'grow_light',
        brand: 'Spider Farmer'
      },
      transformedUrl: 'https://m.media-amazon.com/images/I/81VmimIiOPL._AC_SL1500_.jpg',
      affiliateLink: 'https://www.amazon.com/dp/B07VL8FZS1?tag=whaisurbfar-20'
    });
  }
  
  return suggestions;
}

// Helper function for treatment recommendations
function getTreatmentRecommendation(issueName: string): string {
  const treatments: { [key: string]: string } = {
    'powdery_mildew': 'Increase air circulation, reduce humidity, apply neem oil',
    'spider_mites': 'Spray with insecticidal soap, introduce predatory mites',
    'nitrogen_deficiency': 'Apply nitrogen-rich fertilizer, check pH levels',
    'light_burn': 'Increase distance from lights, reduce light intensity',
    'overwatering': 'Reduce watering frequency, improve drainage'
  };
  
  const key = issueName.toLowerCase().replace(/\s+/g, '_');
  return treatments[key] || 'Consult with a plant health specialist';
}

// Index existing equipment for visual search
export async function indexEquipmentCatalog(): Promise<void> {
  try {
    // Get all equipment images
    const equipment = await cloudinary.search
      .expression('folder:equipment AND resource_type:image')
      .with_field('context')
      .with_field('metadata')
      .max_results(500)
      .execute();

    // Update each image with searchable metadata
    const updatePromises = equipment.resources.map(async (resource) => {
      return cloudinary.uploader.explicit(resource.public_id, {
        type: 'upload',
        
        // Enable visual search
        visual_search: true,
        
        // Add/update metadata
        context: {
          ...resource.context,
          indexed_for_search: true,
          indexed_at: new Date().toISOString()
        },
        
        // Auto-tag for better search
        categorization: 'google_tagging',
        auto_tagging: 80,
        
        // Generate phash for duplicate detection
        phash: true
      });
    });

    await Promise.all(updatePromises);
    
    logger.info('api', `Indexed ${equipment.resources.length} equipment items for visual search`);
    
  } catch (error) {
    logger.error('api', 'Failed to index equipment catalog:', error );
    throw error;
  }
}