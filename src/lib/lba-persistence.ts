// Database persistence for Location-Based Analysis reports
// Handles saving, loading, and managing LBA report history

import { LBAReport } from '@/lib/location-based-analysis';

export interface StoredLBAReport extends LBAReport {
  id: string;
  userId?: string;
  savedAt: Date;
  name: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
}

// Local storage key for LBA reports
const LBA_REPORTS_KEY = 'vibelux_lba_reports';

// Get all saved LBA reports for current user
export function getSavedLBAReports(userId?: string): StoredLBAReport[] {
  try {
    const stored = localStorage.getItem(LBA_REPORTS_KEY);
    if (!stored) return [];
    
    const allReports: StoredLBAReport[] = JSON.parse(stored);
    
    // Filter by userId if provided, otherwise return all
    return userId 
      ? allReports.filter(report => report.userId === userId)
      : allReports;
  } catch (error) {
    console.error('Error loading LBA reports:', error);
    return [];
  }
}

// Save new LBA report
export function saveLBAReport(
  report: LBAReport,
  metadata: {
    name: string;
    description?: string;
    tags?: string[];
    userId?: string;
    isPublic?: boolean;
  }
): StoredLBAReport {
  try {
    const storedReport: StoredLBAReport = {
      ...report,
      id: `lba_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date(),
      name: metadata.name,
      description: metadata.description,
      tags: metadata.tags || [],
      userId: metadata.userId,
      isPublic: metadata.isPublic || false
    };

    const existingReports = getSavedLBAReports();
    const updatedReports = [...existingReports, storedReport];
    
    localStorage.setItem(LBA_REPORTS_KEY, JSON.stringify(updatedReports));
    
    return storedReport;
  } catch (error) {
    console.error('Error saving LBA report:', error);
    throw new Error('Failed to save LBA report');
  }
}

// Update existing LBA report
export function updateLBAReport(
  reportId: string,
  updates: Partial<StoredLBAReport>
): StoredLBAReport | null {
  try {
    const existingReports = getSavedLBAReports();
    const reportIndex = existingReports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const updatedReport = {
      ...existingReports[reportIndex],
      ...updates,
      savedAt: new Date() // Update save timestamp
    };

    existingReports[reportIndex] = updatedReport;
    localStorage.setItem(LBA_REPORTS_KEY, JSON.stringify(existingReports));
    
    return updatedReport;
  } catch (error) {
    console.error('Error updating LBA report:', error);
    return null;
  }
}

// Delete LBA report
export function deleteLBAReport(reportId: string, userId?: string): boolean {
  try {
    const existingReports = getSavedLBAReports();
    const filteredReports = existingReports.filter(report => {
      // Only allow deletion if user owns the report or no userId specified
      if (userId && report.userId !== userId) return true;
      return report.id !== reportId;
    });

    localStorage.setItem(LBA_REPORTS_KEY, JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error('Error deleting LBA report:', error);
    return false;
  }
}

// Get specific LBA report by ID
export function getLBAReport(reportId: string): StoredLBAReport | null {
  try {
    const allReports = getSavedLBAReports();
    return allReports.find(report => report.id === reportId) || null;
  } catch (error) {
    console.error('Error loading LBA report:', error);
    return null;
  }
}

// Search LBA reports by location or crop
export function searchLBAReports(
  query: string,
  userId?: string
): StoredLBAReport[] {
  try {
    const allReports = getSavedLBAReports(userId);
    const searchTerm = query.toLowerCase();
    
    return allReports.filter(report => {
      // Search in location name
      const locationMatch = 
        report.location.address.city.toLowerCase().includes(searchTerm) ||
        report.location.address.state.toLowerCase().includes(searchTerm);
      
      // Search in crop names
      const cropMatch = report.cropAnalysis.some(crop =>
        crop.cropName.toLowerCase().includes(searchTerm)
      );
      
      // Search in tags
      const tagMatch = report.tags?.some(tag =>
        tag.toLowerCase().includes(searchTerm)
      );
      
      // Search in name and description
      const metadataMatch = 
        report.name.toLowerCase().includes(searchTerm) ||
        report.description?.toLowerCase().includes(searchTerm);
      
      return locationMatch || cropMatch || tagMatch || metadataMatch;
    });
  } catch (error) {
    console.error('Error searching LBA reports:', error);
    return [];
  }
}

// Get LBA reports by location (for comparing different analyses of same location)
export function getLBAReportsByLocation(
  latitude: number,
  longitude: number,
  radius: number = 0.1, // degrees (~11km)
  userId?: string
): StoredLBAReport[] {
  try {
    const allReports = getSavedLBAReports(userId);
    
    return allReports.filter(report => {
      const latDiff = Math.abs(report.location.coordinates.latitude - latitude);
      const lonDiff = Math.abs(report.location.coordinates.longitude - longitude);
      
      return latDiff <= radius && lonDiff <= radius;
    });
  } catch (error) {
    console.error('Error loading reports by location:', error);
    return [];
  }
}

// Export LBA report to JSON for sharing
export function exportLBAReport(reportId: string): string | null {
  try {
    const report = getLBAReport(reportId);
    if (!report) return null;
    
    // Remove sensitive data for export
    const exportData = {
      ...report,
      userId: undefined, // Remove user association
      id: undefined // Remove internal ID
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting LBA report:', error);
    return null;
  }
}

// Import LBA report from JSON
export function importLBAReport(
  jsonData: string,
  userId?: string
): StoredLBAReport | null {
  try {
    const reportData = JSON.parse(jsonData);
    
    // Validate basic structure
    if (!reportData.location || !reportData.cropAnalysis) {
      throw new Error('Invalid LBA report format');
    }
    
    // Save as new report
    return saveLBAReport(reportData, {
      name: `Imported - ${reportData.location.address.city}`,
      description: 'Imported LBA report',
      userId,
      isPublic: false
    });
  } catch (error) {
    console.error('Error importing LBA report:', error);
    return null;
  }
}

// Get report statistics for dashboard
export function getLBAReportStats(userId?: string): {
  totalReports: number;
  locationsAnalyzed: number;
  averageSuitabilityScore: number;
  mostAnalyzedCrop: string;
  recentReports: StoredLBAReport[];
} {
  try {
    const reports = getSavedLBAReports(userId);
    
    if (reports.length === 0) {
      return {
        totalReports: 0,
        locationsAnalyzed: 0,
        averageSuitabilityScore: 0,
        mostAnalyzedCrop: 'None',
        recentReports: []
      };
    }
    
    // Count unique locations
    const uniqueLocations = new Set(
      reports.map(r => `${r.location.coordinates.latitude},${r.location.coordinates.longitude}`)
    );
    
    // Calculate average suitability score
    const allSuitabilityScores = reports.flatMap(r => 
      r.cropAnalysis.map(crop => crop.suitabilityScore)
    );
    const averageSuitabilityScore = allSuitabilityScores.length > 0
      ? allSuitabilityScores.reduce((sum, score) => sum + score, 0) / allSuitabilityScores.length
      : 0;
    
    // Find most analyzed crop
    const cropCounts: Record<string, number> = {};
    reports.forEach(report => {
      report.cropAnalysis.forEach(crop => {
        cropCounts[crop.cropName] = (cropCounts[crop.cropName] || 0) + 1;
      });
    });
    
    const mostAnalyzedCrop = Object.entries(cropCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    // Get recent reports (last 5)
    const recentReports = reports
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, 5);
    
    return {
      totalReports: reports.length,
      locationsAnalyzed: uniqueLocations.size,
      averageSuitabilityScore: Math.round(averageSuitabilityScore),
      mostAnalyzedCrop,
      recentReports
    };
  } catch (error) {
    console.error('Error calculating LBA report stats:', error);
    return {
      totalReports: 0,
      locationsAnalyzed: 0,
      averageSuitabilityScore: 0,
      mostAnalyzedCrop: 'None',
      recentReports: []
    };
  }
}