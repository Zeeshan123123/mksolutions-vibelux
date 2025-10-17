import { enhancedPestIdentification, EnhancedPestIdentificationResult } from '@/lib/ai/enhanced-pest-identification';

// Enhanced Google Vision Service with Claude AI integration
export class GoogleVisionService {
  async analyzeImage(imageBuffer: Buffer): Promise<any> {
    try {
      // Convert buffer to base64 for Claude analysis
      const base64Image = imageBuffer.toString('base64');
      
      // Use enhanced pest identification for comprehensive analysis
      const pestAnalysis = await enhancedPestIdentification.identifyPest({
        imageBase64: base64Image
      });

      return {
        labels: this.extractLabelsFromAnalysis(pestAnalysis),
        objects: this.extractObjectsFromAnalysis(pestAnalysis),
        text: this.extractTextFromAnalysis(pestAnalysis),
        confidence: pestAnalysis.identification.confidence,
        enhancedAnalysis: pestAnalysis
      };
    } catch (error) {
      logger.error('api', 'Vision analysis error:', error );
      return {
        labels: [],
        objects: [],
        text: '',
        confidence: 0,
        error: error.message
      };
    }
  }

  async detectObjects(imageBuffer: Buffer): Promise<any[]> {
    try {
      const analysis = await this.analyzeImage(imageBuffer);
      return analysis.objects || [];
    } catch (error) {
      logger.error('api', 'Object detection error:', error );
      return [];
    }
  }

  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const analysis = await this.analyzeImage(imageBuffer);
      return analysis.text || '';
    } catch (error) {
      logger.error('api', 'Text extraction error:', error );
      return '';
    }
  }

  // Enhanced methods for plant health analysis
  async analyzePlantPhenotype(imageInput: string | Buffer): Promise<any> {
    try {
      const imageBuffer = typeof imageInput === 'string' ? 
        Buffer.from(await fetch(imageInput).then(r => r.arrayBuffer())) : 
        imageInput;
        
      const base64Image = imageBuffer.toString('base64');
      
      const pestAnalysis = await enhancedPestIdentification.identifyPest({
        imageBase64: base64Image
      });

      return {
        healthScore: this.calculateHealthScore(pestAnalysis),
        growthStage: pestAnalysis.lifeStage.stage,
        morphology: pestAnalysis.morphology,
        confidence: pestAnalysis.identification.confidence
      };
    } catch (error) {
      logger.error('api', 'Phenotype analysis error:', error );
      return { healthScore: 0, confidence: 0 };
    }
  }

  async detectPlantDiseases(imageInput: string | Buffer): Promise<any> {
    try {
      const imageBuffer = typeof imageInput === 'string' ? 
        Buffer.from(await fetch(imageInput).then(r => r.arrayBuffer())) : 
        imageInput;
        
      const base64Image = imageBuffer.toString('base64');
      
      const pestAnalysis = await enhancedPestIdentification.identifyPest({
        imageBase64: base64Image
      });

      return {
        diseases: this.extractDiseaseInfo(pestAnalysis),
        severity: pestAnalysis.damage.severity,
        treatmentRecommended: pestAnalysis.damage.economicThreshold.treatmentRecommended,
        confidence: pestAnalysis.identification.confidence
      };
    } catch (error) {
      logger.error('api', 'Disease detection error:', error );
      return { diseases: [], severity: 'unknown', confidence: 0 };
    }
  }

  async identifyPests(imageInput: string | Buffer): Promise<any> {
    try {
      const imageBuffer = typeof imageInput === 'string' ? 
        Buffer.from(await fetch(imageInput).then(r => r.arrayBuffer())) : 
        imageInput;
        
      const base64Image = imageBuffer.toString('base64');
      
      const pestAnalysis = await enhancedPestIdentification.identifyPest({
        imageBase64: base64Image
      });

      return {
        pests: [{
          species: pestAnalysis.identification.taxonomy.scientificName,
          commonName: pestAnalysis.identification.taxonomy.commonName,
          confidence: pestAnalysis.identification.confidence,
          lifeStage: pestAnalysis.lifeStage.stage,
          severity: pestAnalysis.damage.severity,
          economicThreshold: pestAnalysis.damage.economicThreshold,
          recommendations: pestAnalysis.ipm.immediateActions
        }],
        overallConfidence: pestAnalysis.identification.confidence,
        requiresAction: pestAnalysis.damage.economicThreshold.treatmentRecommended
      };
    } catch (error) {
      logger.error('api', 'Pest identification error:', error );
      return { pests: [], overallConfidence: 0, requiresAction: false };
    }
  }

  // Helper methods
  private extractLabelsFromAnalysis(analysis: EnhancedPestIdentificationResult): string[] {
    const labels = [
      analysis.identification.taxonomy.commonName,
      analysis.identification.taxonomy.scientificName,
      analysis.identification.taxonomy.order,
      analysis.identification.taxonomy.family,
      analysis.lifeStage.stage,
      analysis.damage.severity
    ];
    
    return labels.filter(Boolean);
  }

  private extractObjectsFromAnalysis(analysis: EnhancedPestIdentificationResult): any[] {
    return [{
      name: analysis.identification.taxonomy.commonName,
      confidence: analysis.identification.confidence / 100,
      boundingBox: null, // Would need additional analysis for bounding boxes
      taxonomy: analysis.identification.taxonomy
    }];
  }

  private extractTextFromAnalysis(analysis: EnhancedPestIdentificationResult): string {
    return `${analysis.identification.taxonomy.commonName} (${analysis.identification.taxonomy.scientificName}) - ${analysis.damage.severity} severity - ${analysis.identification.confidence}% confidence`;
  }

  private calculateHealthScore(analysis: EnhancedPestIdentificationResult): number {
    // Calculate health score based on pest presence and damage
    let baseScore = 100;
    
    switch (analysis.damage.severity) {
      case 'critical': baseScore -= 80; break;
      case 'severe': baseScore -= 60; break;
      case 'moderate': baseScore -= 40; break;
      case 'minimal': baseScore -= 20; break;
      case 'none': baseScore -= 0; break;
      default: baseScore -= 30;
    }
    
    return Math.max(0, baseScore);
  }

  private extractDiseaseInfo(analysis: EnhancedPestIdentificationResult): any[] {
    // If pest analysis includes disease information
    if (analysis.identification.taxonomy.class === 'Fungi' || 
        analysis.identification.taxonomy.kingdom === 'Fungi') {
      return [{
        name: analysis.identification.taxonomy.commonName,
        scientificName: analysis.identification.taxonomy.scientificName,
        confidence: analysis.identification.confidence,
        severity: analysis.damage.severity
      }];
    }
    
    return [];
  }
}

export const visionService = new GoogleVisionService();
export const googleVisionService = visionService; // Alias for compatibility