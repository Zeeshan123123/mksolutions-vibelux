import { RekognitionClient, DetectLabelsCommand, DetectModerationLabelsCommand, DetectTextCommand } from '@aws-sdk/client-rekognition'
import { PlantDiseaseAnalyzer, type PlantDisease } from '@/lib/plant-disease-database'

// AWS Rekognition client configuration
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export interface PlantAnalysisResult {
  healthScore: number
  conditions: string[]
  diseases: string[]
  pests: string[]
  confidence: number
  recommendations: string[]
  timestamp: Date
  detectedDiseases: PlantDisease[]
  matchScores: { [key: string]: number }
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RekognitionLabel {
  Name?: string
  Confidence?: number
  Instances?: Array<{
    BoundingBox?: {
      Width?: number
      Height?: number
      Left?: number
      Top?: number
    }
    Confidence?: number
  }>
}

export class PlantHealthAnalyzer {
  private diseaseAnalyzer = new PlantDiseaseAnalyzer()

  private plantDiseaseKeywords = [
    'blight', 'mold', 'mildew', 'rust', 'rot', 'wilt', 'spot', 'curl', 'yellowing',
    'browning', 'necrosis', 'lesion', 'canker', 'scab', 'fungus', 'bacteria',
    'virus', 'deficiency', 'burn', 'chlorosis'
  ]

  private plantPestKeywords = [
    'aphid', 'thrips', 'mite', 'whitefly', 'caterpillar', 'beetle', 'bug',
    'scale', 'mealybug', 'leafhopper', 'spider', 'fly', 'moth', 'larvae'
  ]

  private healthyPlantKeywords = [
    'green', 'healthy', 'vibrant', 'lush', 'fresh', 'growing', 'leaf',
    'plant', 'vegetation', 'foliage', 'stem', 'flower', 'bud'
  ]

  async analyzeImage(imageBuffer: Buffer): Promise<PlantAnalysisResult> {
    try {
      // Detect labels in the image
      const labelCommand = new DetectLabelsCommand({
        Image: { Bytes: imageBuffer },
        MaxLabels: 50,
        MinConfidence: 70
      })

      const labelResponse = await rekognitionClient.send(labelCommand)
      const labels = labelResponse.Labels || []

      // Analyze detected labels for plant health indicators
      const analysis = this.analyzeLabels(labels)

      // Use disease database for enhanced analysis
      const labelNames = labels.map(l => l.Name || '').filter(Boolean)
      const diseaseAnalysis = this.diseaseAnalyzer.analyzeSymptoms(labelNames, analysis.confidence)

      // Detect any text in the image (for facility labels, etc.)
      const textCommand = new DetectTextCommand({
        Image: { Bytes: imageBuffer }
      })

      const textResponse = await rekognitionClient.send(textCommand)
      const detectedText = textResponse.TextDetections?.map(t => t.DetectedText).join(' ') || ''

      // Determine overall severity
      const severity = this.determineSeverity(diseaseAnalysis.diseases, analysis.healthScore)

      // Combine recommendations
      const combinedRecommendations = [
        ...this.generateRecommendations(analysis),
        ...diseaseAnalysis.recommendations
      ].slice(0, 8) // Limit to 8 total recommendations

      return {
        healthScore: analysis.healthScore,
        conditions: analysis.conditions,
        diseases: [...analysis.diseases, ...diseaseAnalysis.diseases.map(d => d.name)],
        pests: analysis.pests,
        confidence: analysis.confidence,
        recommendations: combinedRecommendations,
        timestamp: new Date(),
        detectedDiseases: diseaseAnalysis.diseases,
        matchScores: diseaseAnalysis.matchScores,
        severity
      }
    } catch (error) {
      console.error('Error analyzing image with Rekognition:', error)
      throw new Error('Failed to analyze plant image')
    }
  }

  private analyzeLabels(labels: RekognitionLabel[]) {
    let healthScore = 100
    const conditions: string[] = []
    const diseases: string[] = []
    const pests: string[] = []
    let totalConfidence = 0
    let confidenceCount = 0

    for (const label of labels) {
      if (!label.Name || !label.Confidence) continue

      const labelName = label.Name.toLowerCase()
      const confidence = label.Confidence

      totalConfidence += confidence
      confidenceCount++

      // Check for disease indicators
      for (const diseaseKeyword of this.plantDiseaseKeywords) {
        if (labelName.includes(diseaseKeyword)) {
          diseases.push(label.Name)
          healthScore -= Math.min(30, confidence * 0.3)
          conditions.push(`Potential ${diseaseKeyword} detected`)
          break
        }
      }

      // Check for pest indicators
      for (const pestKeyword of this.plantPestKeywords) {
        if (labelName.includes(pestKeyword)) {
          pests.push(label.Name)
          healthScore -= Math.min(25, confidence * 0.25)
          conditions.push(`Potential ${pestKeyword} infestation`)
          break
        }
      }

      // Check for healthy plant indicators
      for (const healthKeyword of this.healthyPlantKeywords) {
        if (labelName.includes(healthKeyword)) {
          healthScore += Math.min(10, confidence * 0.1)
          break
        }
      }

      // Specific condition checks
      if (labelName.includes('yellow') && labelName.includes('leaf')) {
        conditions.push('Possible nutrient deficiency or overwatering')
        healthScore -= 15
      }

      if (labelName.includes('brown') && labelName.includes('leaf')) {
        conditions.push('Possible underwatering or nutrient burn')
        healthScore -= 20
      }

      if (labelName.includes('wilted') || labelName.includes('drooping')) {
        conditions.push('Signs of water stress')
        healthScore -= 25
      }
    }

    // Ensure health score stays within bounds
    healthScore = Math.max(0, Math.min(100, healthScore))

    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

    return {
      healthScore,
      conditions: [...new Set(conditions)], // Remove duplicates
      diseases: [...new Set(diseases)],
      pests: [...new Set(pests)],
      confidence: averageConfidence
    }
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = []

    if (analysis.healthScore >= 80) {
      recommendations.push('Plant appears healthy - continue current care routine')
      recommendations.push('Monitor regularly for any changes')
    } else if (analysis.healthScore >= 60) {
      recommendations.push('Plant shows minor stress - review environmental conditions')
      recommendations.push('Check watering schedule and nutrient levels')
    } else {
      recommendations.push('Plant shows significant stress - immediate attention required')
      recommendations.push('Consult with horticulture specialist')
    }

    if (analysis.diseases.length > 0) {
      recommendations.push('Apply appropriate fungicide or bactericide treatment')
      recommendations.push('Improve air circulation and reduce humidity if possible')
      recommendations.push('Remove affected plant material to prevent spread')
    }

    if (analysis.pests.length > 0) {
      recommendations.push('Apply integrated pest management (IPM) strategies')
      recommendations.push('Consider beneficial insects or organic pest control')
      recommendations.push('Inspect surrounding plants for infestation spread')
    }

    if (analysis.conditions.some(c => c.includes('nutrient'))) {
      recommendations.push('Review fertilization schedule and nutrient balance')
      recommendations.push('Consider soil/nutrient solution testing')
    }

    if (analysis.conditions.some(c => c.includes('water'))) {
      recommendations.push('Adjust watering frequency and amount')
      recommendations.push('Check drainage and root health')
    }

    return recommendations
  }

  private determineSeverity(detectedDiseases: PlantDisease[], healthScore: number): 'low' | 'medium' | 'high' | 'critical' {
    // Check for critical diseases
    if (detectedDiseases.some(d => d.severity === 'critical')) {
      return 'critical'
    }
    
    // Check for high severity diseases
    if (detectedDiseases.some(d => d.severity === 'high')) {
      return 'high'
    }
    
    // Base on health score and detected issues
    if (healthScore < 40 || detectedDiseases.length > 2) {
      return 'high'
    } else if (healthScore < 60 || detectedDiseases.length > 0) {
      return 'medium'  
    } else {
      return 'low'
    }
  }

  async analyzeBatch(imageBuffers: Buffer[]): Promise<PlantAnalysisResult[]> {
    const results: PlantAnalysisResult[] = []
    
    for (const buffer of imageBuffers) {
      try {
        const result = await this.analyzeImage(buffer)
        results.push(result)
      } catch (error) {
        console.error('Error analyzing batch image:', error)
        // Continue with other images even if one fails
      }
    }

    return results
  }
}

export const plantHealthAnalyzer = new PlantHealthAnalyzer()