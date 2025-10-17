/**
 * Build-time stub for comprehensive crop database
 * This file is used during build to prevent initialization
 */

// Export stub that does nothing during build
export const cropDatabase = {
  getCrop: () => null,
  getCropByCategory: () => [],
  searchCrops: () => [],
  getAllCrops: () => [],
  getCategories: () => [],
  updateFromResearch: async () => {}
};

export function getCropDatabase() {
  return cropDatabase;
}

// Export empty class to satisfy imports
export class ComprehensiveCropDatabase {
  getCrop() { return null; }
  getCropByCategory() { return []; }
  searchCrops() { return []; }
  getAllCrops() { return []; }
  getCategories() { return []; }
  async updateFromResearch() {}
  async initializeDatabase() {}
}