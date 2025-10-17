/**
 * Recipe Marketplace Service
 * Client-side service for interacting with recipe marketplace APIs
 */

import { 
  CultivationRecipeData, 
  RecipeSearchFilters, 
  RecipeSearchResult,
  RecipePurchaseData,
  RecipeExecutionData,
  RecipeReviewData,
  PurchaseType,
  UsageRights
} from '@/types/recipe-marketplace';

export class RecipeMarketplaceService {
  private baseUrl = '/api';

  // ====================================================================
  // RECIPE DISCOVERY
  // ====================================================================

  async searchRecipes(filters: Partial<RecipeSearchFilters> = {}): Promise<RecipeSearchResult> {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else if (typeof value === 'object' && value.length === 2) {
          // Handle ranges like [min, max]
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const response = await fetch(`${this.baseUrl}/recipes?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search recipes: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getRecipeById(id: string): Promise<CultivationRecipeData> {
    const response = await fetch(`${this.baseUrl}/recipes/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recipe not found');
      }
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getFeaturedRecipes(): Promise<CultivationRecipeData[]> {
    const result = await this.searchRecipes({
      verified: true,
      sortBy: 'rating',
      limit: 6
    });
    return result.recipes;
  }

  async getPopularRecipes(): Promise<CultivationRecipeData[]> {
    const result = await this.searchRecipes({
      sortBy: 'created', // Would be 'purchases' in real implementation
      limit: 8
    });
    return result.recipes;
  }

  async getRecipesByCreator(creatorId: string): Promise<CultivationRecipeData[]> {
    const result = await this.searchRecipes({
      creator: creatorId,
      limit: 50
    });
    return result.recipes;
  }

  // ====================================================================
  // RECIPE MANAGEMENT
  // ====================================================================

  async createRecipe(recipe: Partial<CultivationRecipeData>): Promise<CultivationRecipeData> {
    const response = await fetch(`${this.baseUrl}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create recipe');
    }
    
    return response.json();
  }

  async updateRecipe(id: string, updates: Partial<CultivationRecipeData>): Promise<CultivationRecipeData> {
    const response = await fetch(`${this.baseUrl}/recipes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update recipe');
    }
    
    return response.json();
  }

  async deleteRecipe(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recipes/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete recipe');
    }
  }

  // ====================================================================
  // PURCHASE & LICENSING
  // ====================================================================

  async initiateRecipePurchase(
    recipeId: string, 
    options: {
      purchaseType: PurchaseType;
      usageRights: UsageRights;
      territory?: string[];
      exclusive?: boolean;
    }
  ): Promise<{ clientSecret: string; amount: number; purchase: RecipePurchaseData }> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate purchase');
    }
    
    return response.json();
  }

  async checkPurchaseStatus(recipeId: string): Promise<{
    purchased: boolean;
    purchase?: RecipePurchaseData;
    paymentStatus?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/purchase`);
    
    if (!response.ok) {
      throw new Error('Failed to check purchase status');
    }
    
    return response.json();
  }

  async getUserPurchases(): Promise<RecipePurchaseData[]> {
    const response = await fetch(`${this.baseUrl}/user/purchases`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user purchases');
    }
    
    return response.json();
  }

  // ====================================================================
  // EXECUTION TRACKING
  // ====================================================================

  async startExecution(
    recipeId: string, 
    options: {
      startDate: Date;
      expectedHarvestDate?: Date;
      notes?: string;
    }
  ): Promise<RecipeExecutionData> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: options.startDate.toISOString(),
        expectedHarvestDate: options.expectedHarvestDate?.toISOString(),
        notes: options.notes,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start execution');
    }
    
    return response.json();
  }

  async updateExecution(
    executionId: string, 
    data: Partial<RecipeExecutionData>
  ): Promise<RecipeExecutionData> {
    // Convert dates to ISO strings for API
    const apiData = { ...data };
    if (apiData.actualHarvestDate) {
      (apiData as any).actualHarvestDate = apiData.actualHarvestDate.toISOString();
    }
    if (apiData.environmentalLogs) {
      apiData.environmentalLogs = apiData.environmentalLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      }));
    }
    
    const response = await fetch(`${this.baseUrl}/executions/${executionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update execution');
    }
    
    return response.json();
  }

  async getExecution(executionId: string): Promise<RecipeExecutionData> {
    const response = await fetch(`${this.baseUrl}/executions/${executionId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Execution not found');
      }
      throw new Error('Failed to fetch execution');
    }
    
    return response.json();
  }

  async getUserExecutions(): Promise<RecipeExecutionData[]> {
    const response = await fetch(`${this.baseUrl}/user/executions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user executions');
    }
    
    return response.json();
  }

  async getRecipeExecutions(recipeId: string): Promise<{
    executions: RecipeExecutionData[];
    performanceMetrics: any;
  }> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/execute`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe executions');
    }
    
    return response.json();
  }

  // ====================================================================
  // REVIEWS & RATINGS
  // ====================================================================

  async addReview(
    recipeId: string, 
    review: {
      rating: number;
      title?: string;
      content: string;
      yieldRating?: number;
      qualityRating?: number;
      clarityRating?: number;
    }
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add review');
    }
  }

  async getRecipeReviews(recipeId: string): Promise<RecipeReviewData[]> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/reviews`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    return response.json();
  }

  // ====================================================================
  // FAVORITES
  // ====================================================================

  async addToFavorites(recipeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/favorite`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to favorites');
    }
  }

  async removeFromFavorites(recipeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/favorite`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }
  }

  async getUserFavorites(): Promise<CultivationRecipeData[]> {
    const response = await fetch(`${this.baseUrl}/user/favorites`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    
    return response.json();
  }

  // ====================================================================
  // CORRELATIONS & INSIGHTS
  // ====================================================================

  async getRecipeCorrelations(recipeId: string) {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/correlations`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch correlations');
    }
    
    return response.json();
  }

  async getInsights() {
    const response = await fetch(`${this.baseUrl}/insights`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }
    
    return response.json();
  }

  // ====================================================================
  // ANALYTICS
  // ====================================================================

  async getMarketplaceStats() {
    const response = await fetch(`${this.baseUrl}/marketplace/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch marketplace stats');
    }
    
    return response.json();
  }

  async getCreatorDashboard(creatorId?: string) {
    const url = creatorId 
      ? `${this.baseUrl}/creators/${creatorId}/dashboard`
      : `${this.baseUrl}/user/creator-dashboard`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch creator dashboard');
    }
    
    return response.json();
  }
}

// Export singleton instance
export const recipeMarketplaceService = new RecipeMarketplaceService();