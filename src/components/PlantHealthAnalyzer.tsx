'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Bug,
  Droplets,
  Sun,
  Clock,
  FileImage,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Zap
} from 'lucide-react'

interface PlantAnalysisResult {
  healthScore: number
  conditions: string[]
  diseases: string[]
  pests: string[]
  confidence: number
  recommendations: string[]
  timestamp: string
  fileName: string
  fileSize: number
}

interface AnalysisHistory {
  id: string
  result: PlantAnalysisResult
  imageUrl: string
}

export function PlantHealthAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PlantAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [useExpertAnalysis, setUseExpertAnalysis] = useState(false)
  const [enhancedResult, setEnhancedResult] = useState<any>(null)

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file)
    setAnalysisResult(null)
    setError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError(null)
    setEnhancedResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      // Add enhancement parameter if expert analysis is enabled
      const url = useExpertAnalysis 
        ? '/api/plant-analysis?enhance=true' 
        : '/api/plant-analysis'

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.analysis)
        
        // Store enhanced data separately if available
        if (data.analysis.enhanced) {
          setEnhancedResult(data.analysis)
        }
        
        // Add to history
        const historyItem: AnalysisHistory = {
          id: Date.now().toString(),
          result: data.analysis,
          imageUrl: imagePreview || ''
        }
        setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)]) // Keep last 5 analyses
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setAnalysisResult(null)
    setError(null)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          AI Plant Health Analyzer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload plant images for instant health assessment and care recommendations
        </p>
      </div>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Plant Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drop your plant image here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400">
                Supports JPEG, PNG, WebP • Max 10MB
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Plant to analyze"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FileImage className="w-4 h-4" />
                  {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)}KB)
                </div>
                
                <div className="space-y-4">
                  {/* Expert Analysis Toggle */}
                  <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="expert-mode" className="text-sm font-medium">
                      Computer Vision Only
                    </Label>
                    <Switch
                      id="expert-mode"
                      checked={useExpertAnalysis}
                      onCheckedChange={setUseExpertAnalysis}
                    />
                    <Label htmlFor="expert-mode" className="text-sm font-medium">
                      + Expert AI Analysis
                    </Label>
                    <Brain className="w-4 h-4 text-purple-500" />
                  </div>
                  
                  {useExpertAnalysis && (
                    <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <AlertDescription className="text-purple-700 dark:text-purple-200">
                        <strong>Expert AI Enhancement:</strong> Combines computer vision with professional plant pathologist expertise for more accurate diagnosis and treatment recommendations.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className={useExpertAnalysis ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {useExpertAnalysis ? 'Analyzing with Expert AI...' : 'Analyzing Plant...'}
                      </>
                    ) : (
                      <>
                        {useExpertAnalysis ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Expert AI Analysis
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 mr-2" />
                            Analyze Plant Health
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Analysis Results */}
      {enhancedResult && enhancedResult.enhanced && (
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Brain className="w-5 h-5" />
              Expert AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {enhancedResult.consensusScore}%
                </div>
                <p className="text-xs text-purple-600">Consensus Score</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {enhancedResult.analysisQuality.toUpperCase()}
                </div>
                <p className="text-xs text-purple-600">Analysis Quality</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {enhancedResult.claudeAnalysis?.treatmentPriority.toUpperCase()}
                </div>
                <p className="text-xs text-purple-600">Treatment Priority</p>
              </div>
            </div>

            {enhancedResult.conflictingOpinions && enhancedResult.conflictingOpinions.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Analysis Comparison:
                </h4>
                <div className="space-y-2">
                  {enhancedResult.conflictingOpinions.map((opinion: string, index: number) => (
                    <p key={index} className="text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900 p-2 rounded">
                      {opinion}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {enhancedResult.claudeAnalysis?.expertInsights && enhancedResult.claudeAnalysis.expertInsights.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Expert Insights:
                </h4>
                <div className="space-y-1">
                  {enhancedResult.claudeAnalysis.expertInsights.map((insight: string, index: number) => (
                    <p key={index} className="text-sm text-purple-700 dark:text-purple-300">
                      • {insight}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Plant Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getHealthColor(analysisResult.healthScore)}`}>
                  {analysisResult.healthScore}%
                </div>
                <Badge className={getHealthBadgeColor(analysisResult.healthScore)}>
                  {analysisResult.healthScore >= 80 ? 'Healthy' : 
                   analysisResult.healthScore >= 60 ? 'Fair' : 'Poor'}
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.healthScore} 
                className="h-3"
              />
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Confidence: {analysisResult.confidence}%
              </div>
            </CardContent>
          </Card>

          {/* Detected Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Detected Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.diseases.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Potential Diseases:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.diseases.map((disease, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.pests.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                    Potential Pests:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.pests.map((pest, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <Bug className="w-3 h-3 mr-1" />
                        {pest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.conditions.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                    Conditions Detected:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {analysisResult.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.diseases.length === 0 && 
               analysisResult.pests.length === 0 && 
               analysisResult.conditions.length === 0 && (
                <div className="text-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No significant issues detected!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Care Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisHistory.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <img
                    src={item.imageUrl}
                    alt="Previous analysis"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${getHealthColor(item.result.healthScore)}`}>
                        {item.result.healthScore}% Health
                      </span>
                      <Badge className={getHealthBadgeColor(item.result.healthScore)} size="sm">
                        {item.result.healthScore >= 80 ? 'Healthy' : 
                         item.result.healthScore >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.result.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}