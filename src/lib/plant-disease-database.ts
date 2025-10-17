// Plant Disease Database for Enhanced Recognition
export interface PlantDisease {
  id: string
  name: string
  commonNames: string[]
  symptoms: string[]
  visualIndicators: string[]
  causes: string[]
  treatment: string[]
  prevention: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  crops: string[]
}

export const PLANT_DISEASES: PlantDisease[] = [
  {
    id: 'powdery-mildew',
    name: 'Powdery Mildew',
    commonNames: ['white mold', 'flour disease'],
    symptoms: ['white powdery coating on leaves', 'leaf distortion', 'stunted growth'],
    visualIndicators: ['white', 'powder', 'dusty', 'coating', 'spots'],
    causes: ['high humidity', 'poor air circulation', 'overcrowding'],
    treatment: [
      'Apply fungicide (potassium bicarbonate or neem oil)',
      'Improve air circulation',
      'Remove affected leaves',
      'Reduce humidity to below 60%'
    ],
    prevention: [
      'Maintain proper spacing between plants',
      'Ensure good air circulation',
      'Monitor humidity levels',
      'Regular plant inspection'
    ],
    severity: 'medium',
    crops: ['cannabis', 'tomato', 'cucumber', 'lettuce', 'herbs']
  },
  {
    id: 'spider-mites',
    name: 'Spider Mites',
    commonNames: ['two-spotted spider mite', 'red spider mite'],
    symptoms: ['tiny yellow/white spots on leaves', 'fine webbing', 'leaf bronzing'],
    visualIndicators: ['spots', 'stippling', 'web', 'bronze', 'yellow spots'],
    causes: ['hot dry conditions', 'low humidity', 'stressed plants'],
    treatment: [
      'Increase humidity to 50-60%',
      'Apply predatory mites (biological control)',
      'Use insecticidal soap or neem oil',
      'Remove heavily infested leaves'
    ],
    prevention: [
      'Maintain adequate humidity',
      'Regular plant inspection',
      'Quarantine new plants',
      'Beneficial insect releases'
    ],
    severity: 'high',
    crops: ['cannabis', 'tomato', 'pepper', 'strawberry', 'herbs']
  },
  {
    id: 'aphids',
    name: 'Aphids',
    commonNames: ['plant lice', 'green flies'],
    symptoms: ['clusters of small insects', 'honeydew secretion', 'curled leaves'],
    visualIndicators: ['green insects', 'clusters', 'sticky', 'curled leaves'],
    causes: ['nitrogen-rich conditions', 'stressed plants', 'ant farming'],
    treatment: [
      'Release ladybugs or lacewings',
      'Apply insecticidal soap',
      'Use yellow sticky traps',
      'Spray with water to dislodge'
    ],
    prevention: [
      'Avoid over-fertilization with nitrogen',
      'Regular monitoring',
      'Beneficial insects',
      'Reflective mulch'
    ],
    severity: 'medium',
    crops: ['cannabis', 'lettuce', 'pepper', 'tomato', 'leafy greens']
  },
  {
    id: 'thrips',
    name: 'Thrips',
    commonNames: ['thunder flies', 'storm flies'],
    symptoms: ['silver/bronze streaks on leaves', 'black specks', 'leaf distortion'],
    visualIndicators: ['silver streaks', 'bronze', 'specks', 'scratches'],
    causes: ['dry conditions', 'poor ventilation', 'contaminated growing medium'],
    treatment: [
      'Blue sticky traps',
      'Predatory mites (Amblyseius cucumeris)',
      'Insecticidal soap applications',
      'Remove affected leaves'
    ],
    prevention: [
      'Regular inspection of undersides of leaves',
      'Quarantine new plants',
      'Maintain proper humidity',
      'Screen ventilation openings'
    ],
    severity: 'high',
    crops: ['cannabis', 'tomato', 'pepper', 'cucumber', 'ornamentals']
  },
  {
    id: 'botrytis',
    name: 'Botrytis (Gray Mold)',
    commonNames: ['gray mold', 'bud rot'],
    symptoms: ['fuzzy gray growth', 'brown/dying tissue', 'musty odor'],
    visualIndicators: ['gray', 'fuzzy', 'mold', 'brown spots', 'dying'],
    causes: ['high humidity', 'poor air circulation', 'dead plant material'],
    treatment: [
      'Remove affected areas immediately',
      'Improve air circulation',
      'Reduce humidity below 50%',
      'Apply fungicide if severe'
    ],
    prevention: [
      'Maintain low humidity (40-50%)',
      'Excellent air circulation',
      'Remove dead plant material',
      'Avoid overwatering'
    ],
    severity: 'critical',
    crops: ['cannabis', 'tomato', 'strawberry', 'lettuce', 'herbs']
  },
  {
    id: 'nutrient-deficiency',
    name: 'Nutrient Deficiency',
    commonNames: ['yellowing', 'chlorosis', 'deficiency'],
    symptoms: ['yellowing leaves', 'brown tips', 'stunted growth', 'discoloration'],
    visualIndicators: ['yellow', 'brown tips', 'pale', 'discolored', 'small'],
    causes: ['imbalanced nutrients', 'pH issues', 'overwatering', 'root problems'],
    treatment: [
      'Test nutrient solution pH (5.5-6.5)',
      'Adjust nutrient concentrations',
      'Flush growing medium if needed',
      'Check root health'
    ],
    prevention: [
      'Regular pH and EC monitoring',
      'Balanced nutrient program',
      'Proper watering practices',
      'Quality growing medium'
    ],
    severity: 'medium',
    crops: ['cannabis', 'tomato', 'pepper', 'lettuce', 'herbs', 'leafy greens']
  },
  {
    id: 'root-rot',
    name: 'Root Rot',
    commonNames: ['pythium', 'root disease'],
    symptoms: ['brown/black roots', 'wilting despite wet soil', 'stunted growth'],
    visualIndicators: ['wilting', 'brown', 'dying', 'stunted'],
    causes: ['overwatering', 'poor drainage', 'contaminated water/medium'],
    treatment: [
      'Improve drainage immediately',
      'Reduce watering frequency',
      'Apply beneficial bacteria (Bacillus)',
      'Consider hydrogen peroxide treatment'
    ],
    prevention: [
      'Proper drainage in growing medium',
      'Avoid overwatering',
      'Use sterile growing conditions',
      'Monitor root health regularly'
    ],
    severity: 'critical',
    crops: ['cannabis', 'tomato', 'pepper', 'lettuce', 'herbs']
  },
  {
    id: 'whiteflies',
    name: 'Whiteflies',
    commonNames: ['greenhouse whitefly'],
    symptoms: ['small white flying insects', 'honeydew secretion', 'yellowing leaves'],
    visualIndicators: ['white insects', 'flying', 'yellow', 'sticky'],
    causes: ['warm temperatures', 'high humidity', 'overcrowding'],
    treatment: [
      'Yellow sticky traps',
      'Encarsia formosa (parasitic wasp)',
      'Insecticidal soap spray',
      'Vacuum adults in morning'
    ],
    prevention: [
      'Screen all air intakes',
      'Quarantine new plants',
      'Regular monitoring',
      'Beneficial insects'
    ],
    severity: 'medium',
    crops: ['cannabis', 'tomato', 'pepper', 'cucumber', 'herbs']
  }
]

export class PlantDiseaseAnalyzer {
  analyzeSymptoms(detectedLabels: string[], confidence: number): {
    diseases: PlantDisease[]
    matchScores: { [key: string]: number }
    recommendations: string[]
  } {
    const matchScores: { [key: string]: number } = {}
    const detectedDiseases: PlantDisease[] = []
    
    // Convert labels to lowercase for matching
    const lowerLabels = detectedLabels.map(label => label.toLowerCase())
    
    for (const disease of PLANT_DISEASES) {
      let score = 0
      let matches = 0
      
      // Check visual indicators
      for (const indicator of disease.visualIndicators) {
        if (lowerLabels.some(label => label.includes(indicator))) {
          score += 10
          matches++
        }
      }
      
      // Check symptoms in detected text
      for (const symptom of disease.symptoms) {
        const symptomWords = symptom.toLowerCase().split(' ')
        if (symptomWords.some(word => lowerLabels.some(label => label.includes(word)))) {
          score += 15
          matches++
        }
      }
      
      // Boost score based on confidence
      score = score * (confidence / 100)
      
      if (score > 10 && matches > 0) {
        matchScores[disease.id] = score
        detectedDiseases.push(disease)
      }
    }
    
    // Sort diseases by match score
    detectedDiseases.sort((a, b) => matchScores[b.id] - matchScores[a.id])
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedDiseases.slice(0, 3))
    
    return {
      diseases: detectedDiseases.slice(0, 5), // Top 5 matches
      matchScores,
      recommendations
    }
  }
  
  private generateRecommendations(diseases: PlantDisease[]): string[] {
    const recommendations = new Set<string>()
    
    if (diseases.length === 0) {
      recommendations.add('Plant appears healthy - continue current care routine')
      recommendations.add('Monitor regularly for any changes')
      return Array.from(recommendations)
    }
    
    // Add treatment recommendations
    diseases.forEach(disease => {
      disease.treatment.slice(0, 2).forEach(treatment => {
        recommendations.add(treatment)
      })
    })
    
    // Add prevention recommendations
    diseases.slice(0, 2).forEach(disease => {
      disease.prevention.slice(0, 1).forEach(prevention => {
        recommendations.add(`Prevention: ${prevention}`)
      })
    })
    
    // Add severity-based recommendations
    const criticalDiseases = diseases.filter(d => d.severity === 'critical')
    if (criticalDiseases.length > 0) {
      recommendations.add('⚠️ URGENT: Critical condition detected - immediate action required')
      recommendations.add('Consider consulting with a plant pathologist')
    }
    
    const highSeverity = diseases.filter(d => d.severity === 'high')
    if (highSeverity.length > 0) {
      recommendations.add('High priority treatment needed within 24-48 hours')
    }
    
    return Array.from(recommendations).slice(0, 8) // Limit to 8 recommendations
  }
  
  getCropSpecificDiseases(cropType: string): PlantDisease[] {
    return PLANT_DISEASES.filter(disease => 
      disease.crops.includes(cropType.toLowerCase())
    )
  }
  
  getDiseaseById(id: string): PlantDisease | undefined {
    return PLANT_DISEASES.find(disease => disease.id === id)
  }
}