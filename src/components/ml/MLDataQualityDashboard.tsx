'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Database,
  Brain,
  Zap,
  Target,
  Settings,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';

interface DataQualityMetrics {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    readyForML: boolean;
  };
  completeness: {
    score: number;
    missingDataPercentage: number;
    fieldsWithMissingData: string[];
    criticalFieldsMissing: string[];
  };
  consistency: {
    score: number;
    inconsistentFields: Array<{
      field: string;
      issue: string;
      affectedRecords: number;
    }>;
  };
  accuracy: {
    score: number;
    outliers: Array<{
      field: string;
      value: any;
      expected: string;
      recordIndex: number;
    }>;
    anomalies: Array<{
      field: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  validity: {
    score: number;
    invalidRecords: number;
    validationErrors: Array<{
      field: string;
      rule: string;
      message: string;
      recordIndex: number;
    }>;
  };
  uniqueness: {
    score: number;
    duplicateRecords: number;
    duplicateFields: Array<{
      field: string;
      duplicateCount: number;
    }>;
  };
  recommendations: string[];
  mlReadinessChecks: {
    sufficientData: boolean;
    balancedTarget: boolean;
    noDataLeakage: boolean;
    temporalConsistency: boolean;
    featureVariability: boolean;
  };
}

interface FeatureQuality {
  featureName: string;
  dataType: string;
  quality: {
    completeness: number;
    uniqueness: number;
    consistency: number;
    validity: number;
  };
  statistics: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    std?: number;
  };
  distribution: {
    type: string;
    outlierCount: number;
    outlierPercentage: number;
  };
  mlSuitability: {
    score: number;
    variance: number;
    issues: string[];
  };
  recommendations: string[];
}

interface DataImportResult {
  fileName: string;
  recordCount: number;
  fields: string[];
  dataQuality: DataQualityMetrics;
  featureQuality?: FeatureQuality[];
  mlTraining?: any;
  recommendations: string[];
}

export default function MLDataQualityDashboard() {
  const [importResult, setImportResult] = useState<DataImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const handleFileUpload = async (file: File, mode: string = 'validate') => {
    setSelectedFile(file);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const response = await fetch('/api/ml/data-import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const result = await response.json();
      setImportResult(result);
    } catch (error) {
      logger.error('system', 'File upload error:', error );
    } finally {
      setProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-500';
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!importResult) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <Database className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">ML Data Quality Dashboard</h1>
              <p className="text-gray-400 mb-6">
                Upload your Excel or CSV file to assess data quality and ML readiness
              </p>
              
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 mb-4">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-white font-medium">
                    {processing ? 'Processing...' : 'Choose file or drag and drop'}
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    CSV, Excel, or JSON files up to 100MB
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Data Quality Assessment
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  AI Field Interpretation
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  ML Readiness Analysis
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Data Quality Dashboard</h1>
            <p className="text-gray-400">
              File: {importResult.fileName} • {importResult.recordCount} records
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setImportResult(null)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New File
            </button>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white ${getGradeColor(importResult.dataQuality.overall.grade)}`}>
                {importResult.dataQuality.overall.grade}
              </div>
              <div className="mt-2">
                <div className={`text-2xl font-bold ${getScoreColor(importResult.dataQuality.overall.score)}`}>
                  {importResult.dataQuality.overall.score}/100
                </div>
                <div className="text-gray-400 text-sm">Overall Score</div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(importResult.dataQuality.completeness.score)}`}>
                    {importResult.dataQuality.completeness.score}
                  </div>
                  <div className="text-gray-400 text-sm">Completeness</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(importResult.dataQuality.consistency.score)}`}>
                    {importResult.dataQuality.consistency.score}
                  </div>
                  <div className="text-gray-400 text-sm">Consistency</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(importResult.dataQuality.accuracy.score)}`}>
                    {importResult.dataQuality.accuracy.score}
                  </div>
                  <div className="text-gray-400 text-sm">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(importResult.dataQuality.validity.score)}`}>
                    {importResult.dataQuality.validity.score}
                  </div>
                  <div className="text-gray-400 text-sm">Validity</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(importResult.dataQuality.uniqueness.score)}`}>
                    {importResult.dataQuality.uniqueness.score}
                  </div>
                  <div className="text-gray-400 text-sm">Uniqueness</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {importResult.dataQuality.overall.readyForML ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={importResult.dataQuality.overall.readyForML ? 'text-green-400' : 'text-red-400'}>
                    {importResult.dataQuality.overall.readyForML ? 'Ready for ML' : 'Not Ready for ML'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{importResult.fields.length} fields detected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ML Readiness Checks */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">ML Readiness Checks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(importResult.dataQuality.mlReadinessChecks).map(([check, passed]) => (
              <div key={check} className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm ${passed ? 'text-green-400' : 'text-red-400'}`}>
                  {check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis Sections */}
        <div className="space-y-4">
          {/* Completeness Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('completeness')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('completeness') ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="text-lg font-semibold text-white">Data Completeness</h3>
                <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(importResult.dataQuality.completeness.score)}`}>
                  {importResult.dataQuality.completeness.score}/100
                </div>
              </div>
            </button>
            
            {expandedSections.has('completeness') && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">
                      {importResult.dataQuality.completeness.missingDataPercentage.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Missing Data</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">
                      {importResult.dataQuality.completeness.fieldsWithMissingData.length}
                    </div>
                    <div className="text-gray-400 text-sm">Fields with Missing Data</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">
                      {importResult.dataQuality.completeness.criticalFieldsMissing.length}
                    </div>
                    <div className="text-gray-400 text-sm">Critical Fields Missing</div>
                  </div>
                </div>
                
                {importResult.dataQuality.completeness.fieldsWithMissingData.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Fields with Missing Data:</h4>
                    <div className="flex flex-wrap gap-2">
                      {importResult.dataQuality.completeness.fieldsWithMissingData.map(field => (
                        <span key={field} className="bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded text-sm">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accuracy Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('accuracy')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('accuracy') ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="text-lg font-semibold text-white">Data Accuracy</h3>
                <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(importResult.dataQuality.accuracy.score)}`}>
                  {importResult.dataQuality.accuracy.score}/100
                </div>
              </div>
            </button>
            
            {expandedSections.has('accuracy') && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">
                      {importResult.dataQuality.accuracy.outliers.length}
                    </div>
                    <div className="text-gray-400 text-sm">Outliers Detected</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">
                      {importResult.dataQuality.accuracy.anomalies.length}
                    </div>
                    <div className="text-gray-400 text-sm">Anomalies Found</div>
                  </div>
                </div>

                {importResult.dataQuality.accuracy.anomalies.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Anomalies:</h4>
                    <div className="space-y-2">
                      {importResult.dataQuality.accuracy.anomalies.slice(0, 5).map((anomaly, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className={`w-4 h-4 ${
                              anomaly.severity === 'high' ? 'text-red-400' :
                              anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                            <span className="text-white font-medium">{anomaly.field}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              anomaly.severity === 'high' ? 'bg-red-900/20 text-red-400' :
                              anomaly.severity === 'medium' ? 'bg-yellow-900/20 text-yellow-400' : 'bg-blue-900/20 text-blue-400'
                            }`}>
                              {anomaly.severity}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{anomaly.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            <div className="space-y-2">
              {importResult.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}