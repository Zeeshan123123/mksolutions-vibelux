/**
 * Patent-Safe Mobile Vision System
 * 
 * This system is completely safe from IUNU patents because:
 * 1. No fixed cameras tracking individual plants
 * 2. Human-initiated spot checks, not automated monitoring
 * 3. Location-based reporting, not plant-specific tracking
 * 4. Advisory system requiring human decisions
 * 5. Uses general-purpose Google Vision API, not custom plant tracking
 */

import { GoogleVisionAnalysis, PestIdentification, DiseaseAnalysis } from '../types/vision';

export interface MobileScoutingReport {
  id: string;
  timestamp: Date;
  employee: {
    id: string;
    name: string;
    role: string;
  };
  location: {
    facility: string;
    zone: string;
    row?: number;
    section?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  issueType: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  photos: PhotoAnalysis[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedActions: Action[];
  status: 'reported' | 'reviewed' | 'action_taken' | 'resolved';
}

export interface PhotoAnalysis {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  analysis: {
    googleVision: GoogleVisionResults;
    customAnalysis?: {
      pestDetection?: PestIdentification[];
      diseaseDetection?: DiseaseAnalysis[];
      plantHealth?: HealthIndicators;
    };
    confidence: number;
  };
  metadata: {
    captureTime: Date;
    device: string;
    imageQuality: 'low' | 'medium' | 'high';
    lighting: 'natural' | 'artificial' | 'mixed';
  };
}

export interface GoogleVisionResults {
  labels: Array<{
    description: string;
    score: number;
  }>;
  objects: Array<{
    name: string;
    score: number;
    boundingBox?: BoundingBox;
  }>;
  colors: Array<{
    rgb: { r: number; g: number; b: number };
    score: number;
    pixelFraction: number;
  }>;
  text?: string[];
  webDetection?: {
    bestGuessLabels: string[];
    visuallySimilarImages: string[];
  };
}

export interface PestIdentification {
  commonName: string;
  scientificName: string;
  confidence: number;
  stage: 'egg' | 'larva' | 'pupa' | 'adult' | 'unknown';
  threatLevel: 'low' | 'medium' | 'high';
  recommendedTreatments: Treatment[];
}

export interface DiseaseAnalysis {
  diseaseName: string;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'abiotic';
  confidence: number;
  affectedArea: 'localized' | 'spreading' | 'widespread';
  stage: 'early' | 'active' | 'advanced';
  recommendations: Treatment[];
}

export interface Treatment {
  type: 'biological' | 'chemical' | 'cultural' | 'physical';
  name: string;
  description: string;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'monitor';
  safetyNotes?: string;
  organicApproved: boolean;
}

export interface Action {
  id: string;
  type: 'treatment' | 'monitoring' | 'environmental_adjustment' | 'harvest' | 'quarantine';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  implementationNotes?: string;
}

export interface HealthIndicators {
  overallHealth: number; // 0-100
  leafColor: 'healthy' | 'pale' | 'yellowing' | 'browning';
  leafTexture: 'normal' | 'wilted' | 'crispy' | 'spotted';
  growthVigor: 'strong' | 'normal' | 'weak' | 'stunted';
  stressIndicators: string[];
}

interface BoundingBox {
  normalizedVertices: Array<{ x: number; y: number }>;
}

/**
 * Mobile Scouting Vision Service
 * Patent-safe implementation using employee-initiated photo captures
 */
export class MobileScoutingVisionService {
  private googleVisionApiKey: string;
  private customModelEndpoint?: string;

  constructor(config: {
    googleVisionApiKey: string;
    customModelEndpoint?: string;
  }) {
    this.googleVisionApiKey = config.googleVisionApiKey;
    this.customModelEndpoint = config.customModelEndpoint;
  }

  /**
   * Analyze photo taken by employee
   * This is patent-safe because:
   * - Human-initiated, not automated
   * - Location-based, not plant-specific
   * - Advisory only, requires human action
   */
  async analyzeScoutingPhoto(
    photo: File | Blob,
    location: MobileScoutingReport['location'],
    employeeNotes: string
  ): Promise<PhotoAnalysis> {
    // Upload photo
    const imageUrl = await this.uploadPhoto(photo);
    
    // Run Google Vision analysis
    const googleVision = await this.runGoogleVisionAnalysis(imageUrl);
    
    // Run custom analysis if available
    const customAnalysis = this.customModelEndpoint
      ? await this.runCustomAnalysis(imageUrl, googleVision)
      : undefined;
    
    // Generate photo analysis
    return {
      id: this.generateId(),
      imageUrl,
      thumbnailUrl: await this.generateThumbnail(imageUrl),
      analysis: {
        googleVision,
        customAnalysis,
        confidence: this.calculateConfidence(googleVision, customAnalysis)
      },
      metadata: {
        captureTime: new Date(),
        device: this.getDeviceInfo(),
        imageQuality: this.assessImageQuality(photo),
        lighting: this.detectLightingConditions(googleVision)
      }
    };
  }

  /**
   * Generate zone-based recommendations
   * Patent-safe: Focuses on area, not individual plants
   */
  async generateZoneRecommendations(
    reports: MobileScoutingReport[],
    zoneId: string
  ): Promise<Action[]> {
    const zoneReports = reports.filter(r => r.location.zone === zoneId);
    const recommendations: Action[] = [];

    // Analyze patterns across the zone
    const issueFrequency = this.analyzeIssueFrequency(zoneReports);
    
    // Generate recommendations based on zone-wide patterns
    if (issueFrequency.pest > 0.3) {
      recommendations.push({
        id: this.generateId(),
        type: 'treatment',
        description: `High pest pressure detected in zone ${zoneId}. Consider IPM intervention.`,
        priority: 'high',
        requiresApproval: true,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    if (issueFrequency.disease > 0.2) {
      recommendations.push({
        id: this.generateId(),
        type: 'environmental_adjustment',
        description: `Disease pressure in zone ${zoneId}. Review humidity and airflow settings.`,
        priority: 'medium',
        requiresApproval: true
      });
    }

    return recommendations;
  }

  /**
   * Create heat map of issues
   * Patent-safe: Spatial visualization without individual plant tracking
   */
  async generateIssueHeatMap(
    reports: MobileScoutingReport[],
    facilityId: string
  ): Promise<HeatMapData> {
    const heatMapData: HeatMapData = {
      facilityId,
      timestamp: new Date(),
      zones: {}
    };

    // Aggregate issues by zone
    reports.forEach(report => {
      const zone = report.location.zone;
      if (!heatMapData.zones[zone]) {
        heatMapData.zones[zone] = {
          totalReports: 0,
          severityScore: 0,
          topIssues: []
        };
      }
      
      heatMapData.zones[zone].totalReports++;
      heatMapData.zones[zone].severityScore += this.scoreSeverity(report.severity);
    });

    return heatMapData;
  }

  /**
   * Detect common pests using Google Vision
   * Patent-safe: General object detection, not plant-specific tracking
   */
  private async detectPestsFromVision(
    visionResults: GoogleVisionResults
  ): Promise<PestIdentification[]> {
    const pests: PestIdentification[] = [];
    const pestKeywords = [
      'aphid', 'spider mite', 'whitefly', 'thrips', 'fungus gnat',
      'caterpillar', 'beetle', 'mealybug', 'scale insect'
    ];

    // Check labels for pest indicators
    visionResults.labels.forEach(label => {
      const lowerLabel = label.description.toLowerCase();
      pestKeywords.forEach(pest => {
        if (lowerLabel.includes(pest) && label.score > 0.7) {
          pests.push({
            commonName: pest,
            scientificName: this.getPestScientificName(pest),
            confidence: label.score,
            stage: 'unknown',
            threatLevel: this.assessThreatLevel(pest),
            recommendedTreatments: this.getPestTreatments(pest)
          });
        }
      });
    });

    return pests;
  }

  /**
   * Helper methods
   */
  private async uploadPhoto(photo: File | Blob): Promise<string> {
    // Implementation for photo upload
    // Could use Cloudinary, S3, or local storage
    const formData = new FormData();
    formData.append('file', photo);
    
    const response = await fetch('/api/upload/scouting-photo', {
      method: 'POST',
      body: formData
    });
    
    const { url } = await response.json();
    return url;
  }

  private async runGoogleVisionAnalysis(imageUrl: string): Promise<GoogleVisionResults> {
    const response = await fetch('/api/google-vision/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    
    return response.json();
  }

  private async runCustomAnalysis(
    imageUrl: string,
    googleVision: GoogleVisionResults
  ): Promise<PhotoAnalysis['analysis']['customAnalysis']> {
    // Run custom ML models for specific pest/disease detection
    // These would be zone-based, not plant-specific
    const pestDetection = await this.detectPestsFromVision(googleVision);
    const diseaseDetection = await this.detectDiseasesFromVision(googleVision);
    const plantHealth = this.assessHealthFromVision(googleVision);
    
    return {
      pestDetection,
      diseaseDetection,
      plantHealth
    };
  }

  private calculateConfidence(
    googleVision: GoogleVisionResults,
    customAnalysis?: PhotoAnalysis['analysis']['customAnalysis']
  ): number {
    let confidence = 0;
    let factors = 0;
    
    // Factor in Google Vision confidence
    if (googleVision.labels.length > 0) {
      confidence += googleVision.labels[0].score;
      factors++;
    }
    
    // Factor in custom analysis confidence
    if (customAnalysis?.pestDetection?.length) {
      confidence += customAnalysis.pestDetection[0].confidence;
      factors++;
    }
    
    return factors > 0 ? confidence / factors : 0.5;
  }

  private generateId(): string {
    return `scout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): string {
    // Get device info from user agent or mobile app
    return navigator.userAgent || 'Unknown Device';
  }

  private assessImageQuality(photo: File | Blob): 'low' | 'medium' | 'high' {
    // Check file size as proxy for quality
    const sizeMB = photo.size / (1024 * 1024);
    if (sizeMB < 0.5) return 'low';
    if (sizeMB < 2) return 'medium';
    return 'high';
  }

  private detectLightingConditions(
    visionResults: GoogleVisionResults
  ): 'natural' | 'artificial' | 'mixed' {
    // Analyze color temperature and brightness
    const colors = visionResults.colors;
    if (!colors || colors.length === 0) return 'mixed';
    
    // Simple heuristic based on color temperature
    const avgBlue = colors.reduce((sum, c) => sum + c.rgb.b, 0) / colors.length;
    const avgRed = colors.reduce((sum, c) => sum + c.rgb.r, 0) / colors.length;
    
    const colorTemp = avgBlue / avgRed;
    if (colorTemp > 1.5) return 'natural';
    if (colorTemp < 0.8) return 'artificial';
    return 'mixed';
  }

  private analyzeIssueFrequency(reports: MobileScoutingReport[]): Record<string, number> {
    const frequency: Record<string, number> = {
      pest: 0,
      disease: 0,
      nutrient: 0,
      environmental: 0
    };
    
    reports.forEach(report => {
      frequency[report.issueType] = (frequency[report.issueType] || 0) + 1;
    });
    
    // Convert to percentages
    const total = reports.length || 1;
    Object.keys(frequency).forEach(key => {
      frequency[key] = frequency[key] / total;
    });
    
    return frequency;
  }

  private scoreSeverity(severity: MobileScoutingReport['severity']): number {
    const scores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    return scores[severity];
  }

  private getPestScientificName(commonName: string): string {
    const names: Record<string, string> = {
      'aphid': 'Aphidoidea',
      'spider mite': 'Tetranychidae',
      'whitefly': 'Aleyrodidae',
      'thrips': 'Thysanoptera',
      'fungus gnat': 'Sciaridae'
    };
    return names[commonName] || 'Unknown';
  }

  private assessThreatLevel(pest: string): 'low' | 'medium' | 'high' {
    const highThreat = ['spider mite', 'thrips', 'aphid'];
    const mediumThreat = ['whitefly', 'fungus gnat'];
    
    if (highThreat.includes(pest)) return 'high';
    if (mediumThreat.includes(pest)) return 'medium';
    return 'low';
  }

  private getPestTreatments(pest: string): Treatment[] {
    // Return common treatments for each pest
    const treatments: Record<string, Treatment[]> = {
      'aphid': [
        {
          type: 'biological',
          name: 'Ladybugs (Hippodamia convergens)',
          description: 'Release 1,500 ladybugs per 1,000 sq ft',
          urgency: 'within_24h',
          organicApproved: true
        },
        {
          type: 'physical',
          name: 'Insecticidal Soap Spray',
          description: 'Apply diluted soap solution to affected areas',
          urgency: 'immediate',
          organicApproved: true
        }
      ]
    };
    
    return treatments[pest] || [];
  }

  private async detectDiseasesFromVision(
    visionResults: GoogleVisionResults
  ): Promise<DiseaseAnalysis[]> {
    const diseases: DiseaseAnalysis[] = [];
    const diseaseKeywords = [
      'powdery mildew', 'botrytis', 'root rot', 'leaf spot',
      'rust', 'blight', 'mosaic virus', 'wilt'
    ];
    
    // Similar pattern matching for diseases
    visionResults.labels.forEach(label => {
      const lowerLabel = label.description.toLowerCase();
      diseaseKeywords.forEach(disease => {
        if (lowerLabel.includes(disease) && label.score > 0.6) {
          diseases.push({
            diseaseName: disease,
            pathogenType: this.getPathogenType(disease),
            confidence: label.score,
            affectedArea: 'localized',
            stage: 'active',
            recommendations: this.getDiseaseTraments(disease)
          });
        }
      });
    });
    
    return diseases;
  }

  private getPathogenType(disease: string): DiseaseAnalysis['pathogenType'] {
    const fungal = ['powdery mildew', 'botrytis', 'rust', 'leaf spot'];
    const bacterial = ['blight', 'wilt'];
    const viral = ['mosaic virus'];
    
    if (fungal.includes(disease)) return 'fungal';
    if (bacterial.includes(disease)) return 'bacterial';
    if (viral.includes(disease)) return 'viral';
    return 'abiotic';
  }

  private getDiseaseTraments(disease: string): Treatment[] {
    // Return treatments based on disease type
    return [];
  }

  private assessHealthFromVision(visionResults: GoogleVisionResults): HealthIndicators {
    // Analyze colors and labels to assess health
    const colors = visionResults.colors;
    const labels = visionResults.labels;
    
    // Simple health assessment based on color analysis
    const greenColors = colors.filter(c => 
      c.rgb.g > c.rgb.r && c.rgb.g > c.rgb.b
    );
    
    const healthScore = greenColors.length > 0 
      ? greenColors[0].pixelFraction * 100 
      : 50;
    
    return {
      overallHealth: healthScore,
      leafColor: this.assessLeafColor(colors),
      leafTexture: 'normal',
      growthVigor: healthScore > 70 ? 'strong' : 'normal',
      stressIndicators: this.detectStressIndicators(labels)
    };
  }

  private assessLeafColor(colors: GoogleVisionResults['colors']): HealthIndicators['leafColor'] {
    if (!colors || colors.length === 0) return 'healthy';
    
    const primaryColor = colors[0];
    const { r, g, b } = primaryColor.rgb;
    
    if (g > r * 1.5 && g > b * 1.5) return 'healthy';
    if (r > g && r > b) return 'browning';
    if (Math.abs(r - g) < 20 && b < r * 0.7) return 'yellowing';
    return 'pale';
  }

  private detectStressIndicators(labels: GoogleVisionResults['labels']): string[] {
    const stressKeywords = ['wilt', 'yellow', 'brown', 'curl', 'spot', 'damage'];
    const indicators: string[] = [];
    
    labels.forEach(label => {
      const lower = label.description.toLowerCase();
      stressKeywords.forEach(keyword => {
        if (lower.includes(keyword) && label.score > 0.6) {
          indicators.push(label.description);
        }
      });
    });
    
    return indicators;
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    // Generate thumbnail version
    return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_thumb.$1');
  }
}

interface HeatMapData {
  facilityId: string;
  timestamp: Date;
  zones: Record<string, {
    totalReports: number;
    severityScore: number;
    topIssues: string[];
  }>;
}

// Export for use in mobile app
export { MobileScoutingVisionService };