import Anthropic from '@anthropic-ai/sdk'
import type { PlantAnalysisResult, RekognitionLabel } from '@/lib/aws/rekognition-client'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export interface ClaudeAnalysisResult {
  claudeHealthScore: number
  claudeDiseases: string[]
  claudeRecommendations: string[]
  claudeConfidence: number
  expertInsights: string[]
  treatmentPriority: 'immediate' | 'urgent' | 'moderate' | 'routine'
  followUpActions: string[]
  reasoning: string
}

export interface CombinedAnalysisResult extends PlantAnalysisResult {
  claudeAnalysis: ClaudeAnalysisResult
  consensusScore: number
  conflictingOpinions: string[]
  finalRecommendations: string[]
  analysisQuality: 'high' | 'medium' | 'low'
}

export class ClaudePlantAnalyzer {
  async enhanceAnalysis(
    rekognitionResult: PlantAnalysisResult, 
    rekognitionLabels: RekognitionLabel[],
    imageBase64?: string
  ): Promise<CombinedAnalysisResult> {
    try {
      const claudeAnalysis = await this.getClaudeAnalysis(rekognitionResult, rekognitionLabels, imageBase64)
      
      return this.combineAnalyses(rekognitionResult, claudeAnalysis)
    } catch (error) {
      console.error('Claude analysis failed:', error)
      // Fallback to original analysis if Claude fails
      return {
        ...rekognitionResult,
        claudeAnalysis: {
          claudeHealthScore: rekognitionResult.healthScore,
          claudeDiseases: [],
          claudeRecommendations: ['Claude analysis unavailable - relying on computer vision analysis'],
          claudeConfidence: 0,
          expertInsights: [],
          treatmentPriority: 'moderate',
          followUpActions: [],
          reasoning: 'Claude AI temporarily unavailable'
        },
        consensusScore: rekognitionResult.healthScore,
        conflictingOpinions: [],
        finalRecommendations: rekognitionResult.recommendations,
        analysisQuality: 'medium'
      }
    }
  }

  private async getClaudeAnalysis(
    rekognitionResult: PlantAnalysisResult,
    rekognitionLabels: RekognitionLabel[],
    imageBase64?: string
  ): Promise<ClaudeAnalysisResult> {
    const labelsText = rekognitionLabels
      .map(label => `${label.Name} (${Math.round(label.Confidence || 0)}% confidence)`)
      .join(', ')

    const prompt = `You are an expert plant pathologist and horticulturist analyzing a plant health image. 

COMPUTER VISION ANALYSIS RESULTS:
- Health Score: ${rekognitionResult.healthScore}%
- Detected Visual Elements: ${labelsText}
- Initial Diseases Detected: ${rekognitionResult.diseases.join(', ') || 'None'}
- Initial Conditions: ${rekognitionResult.conditions.join(', ') || 'None'}
- Severity Level: ${rekognitionResult.severity}

DETECTED DISEASES FROM DATABASE:
${rekognitionResult.detectedDiseases?.map(d => 
  `- ${d.name}: ${d.symptoms.join(', ')} (Severity: ${d.severity})`
).join('\n') || 'None detected'}

TASK: As a plant health expert, provide your professional analysis:

1. HEALTH ASSESSMENT: Based on the computer vision data, what's your expert health score (0-100)?

2. DISEASE IDENTIFICATION: Do you agree with the detected diseases? Are there other possibilities based on the visual indicators?

3. EXPERT INSIGHTS: What additional factors should be considered that computer vision might miss?

4. TREATMENT PRIORITY: How urgent is treatment? (immediate/urgent/moderate/routine)

5. PROFESSIONAL RECOMMENDATIONS: What would you recommend as a plant pathologist?

6. FOLLOW-UP ACTIONS: What should the grower monitor going forward?

Please provide specific, actionable advice based on your horticultural expertise. Focus on practical solutions for commercial growing operations.

Respond in this JSON format:
{
  "healthScore": <0-100>,
  "diseases": ["disease1", "disease2"],
  "confidence": <0-100>,
  "treatmentPriority": "immediate|urgent|moderate|routine",
  "recommendations": ["rec1", "rec2", "rec3"],
  "expertInsights": ["insight1", "insight2"],
  "followUpActions": ["action1", "action2"],
  "reasoning": "Your expert reasoning for this assessment"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    try {
      // Extract JSON from Claude's response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response')
      }
      
      const claudeData = JSON.parse(jsonMatch[0])
      
      return {
        claudeHealthScore: claudeData.healthScore || rekognitionResult.healthScore,
        claudeDiseases: claudeData.diseases || [],
        claudeRecommendations: claudeData.recommendations || [],
        claudeConfidence: claudeData.confidence || 75,
        expertInsights: claudeData.expertInsights || [],
        treatmentPriority: claudeData.treatmentPriority || 'moderate',
        followUpActions: claudeData.followUpActions || [],
        reasoning: claudeData.reasoning || 'Analysis completed'
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError)
      
      // Fallback parsing for partial responses
      return {
        claudeHealthScore: rekognitionResult.healthScore,
        claudeDiseases: [],
        claudeRecommendations: ['Claude provided analysis but formatting was unclear'],
        claudeConfidence: 50,
        expertInsights: [responseText.substring(0, 200) + '...'],
        treatmentPriority: 'moderate',
        followUpActions: [],
        reasoning: 'Partial analysis due to response parsing issues'
      }
    }
  }

  private combineAnalyses(
    rekognitionResult: PlantAnalysisResult,
    claudeAnalysis: ClaudeAnalysisResult
  ): CombinedAnalysisResult {
    // Calculate consensus score (weighted average)
    const consensusScore = Math.round(
      (rekognitionResult.healthScore * 0.4) + (claudeAnalysis.claudeHealthScore * 0.6)
    )

    // Identify conflicting opinions
    const conflictingOpinions: string[] = []
    const scoreDifference = Math.abs(rekognitionResult.healthScore - claudeAnalysis.claudeHealthScore)
    
    if (scoreDifference > 20) {
      conflictingOpinions.push(
        `Health score variance: Computer vision suggests ${rekognitionResult.healthScore}%, expert analysis suggests ${claudeAnalysis.claudeHealthScore}%`
      )
    }

    // Check disease agreement
    const rekognitionDiseases = new Set(rekognitionResult.diseases.map(d => d.toLowerCase()))
    const claudeDiseases = new Set(claudeAnalysis.claudeDiseases.map(d => d.toLowerCase()))
    
    const commonDiseases = [...rekognitionDiseases].filter(d => claudeDiseases.has(d))
    const uniqueToRekognition = [...rekognitionDiseases].filter(d => !claudeDiseases.has(d))
    const uniqueToClaude = [...claudeDiseases].filter(d => !rekognitionDiseases.has(d))

    if (uniqueToRekognition.length > 0) {
      conflictingOpinions.push(`Computer vision detected: ${uniqueToRekognition.join(', ')}`)
    }
    if (uniqueToClaude.length > 0) {
      conflictingOpinions.push(`Expert analysis suggests: ${uniqueToClaude.join(', ')}`)
    }

    // Combine recommendations intelligently
    const finalRecommendations = this.mergeRecommendations(
      rekognitionResult.recommendations,
      claudeAnalysis.claudeRecommendations,
      claudeAnalysis.treatmentPriority
    )

    // Determine analysis quality
    const analysisQuality = this.assessAnalysisQuality(
      rekognitionResult.confidence,
      claudeAnalysis.claudeConfidence,
      conflictingOpinions.length
    )

    return {
      ...rekognitionResult,
      healthScore: consensusScore,
      claudeAnalysis,
      consensusScore,
      conflictingOpinions,
      finalRecommendations,
      analysisQuality
    }
  }

  private mergeRecommendations(
    rekognitionRecs: string[],
    claudeRecs: string[],
    priority: string
  ): string[] {
    const combined = new Set<string>()

    // Add priority-based recommendations first
    if (priority === 'immediate' || priority === 'urgent') {
      combined.add('🚨 URGENT: Immediate attention required')
    }

    // Add Claude's expert recommendations (higher priority)
    claudeRecs.forEach(rec => combined.add(`Expert: ${rec}`))
    
    // Add computer vision recommendations
    rekognitionRecs.slice(0, 3).forEach(rec => combined.add(`Detection: ${rec}`))

    return Array.from(combined).slice(0, 10) // Limit to 10 recommendations
  }

  private assessAnalysisQuality(
    rekognitionConfidence: number,
    claudeConfidence: number,
    conflictCount: number
  ): 'high' | 'medium' | 'low' {
    const avgConfidence = (rekognitionConfidence + claudeConfidence) / 2
    
    if (avgConfidence > 80 && conflictCount === 0) return 'high'
    if (avgConfidence > 60 && conflictCount <= 1) return 'medium'
    return 'low'
  }
}

export const claudePlantAnalyzer = new ClaudePlantAnalyzer()