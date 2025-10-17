'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Info, Upload, Download, Settings } from 'lucide-react';
// Temporary type definitions for static export (API routes disabled)
type SmartImportResult = any;
type PreviewData = any;
type DetectedField = any;
type QualityAssessment = any;
type ProcessedData = any;
type ImportIssue = any;
type Recommendation = any;

interface DataImportPreviewProps {
  importResult: SmartImportResult;
  onConfirmImport: (selectedSheets: string[], fieldMappings: Record<string, string>) => void;
  onCancel: () => void;
  onRetryWithOptions: (newOptions: any) => void;
}

export default function DataImportPreview({
  importResult,
  onConfirmImport,
  onCancel,
  onRetryWithOptions
}: DataImportPreviewProps) {
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(
    new Set(importResult.data.map(sheet => sheet.sheetName))
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['quality', 'sheets'])
  );
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleSheet = (sheetName: string) => {
    const newSelected = new Set(selectedSheets);
    if (newSelected.has(sheetName)) {
      newSelected.delete(sheetName);
    } else {
      newSelected.add(sheetName);
    }
    setSelectedSheets(newSelected);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
      case 'high':
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderQualityAssessment = () => {
    if (!importResult.previewData?.qualityAssessment) return null;

    const qa = importResult.previewData.qualityAssessment;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Overall Quality</div>
            <div className={`text-2xl font-bold ${getQualityColor(qa.overall)}`}>
              {qa.overall}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Completeness</div>
            <div className={`text-2xl font-bold ${getQualityColor(qa.completeness)}`}>
              {qa.completeness}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Consistency</div>
            <div className={`text-2xl font-bold ${getQualityColor(qa.consistency)}`}>
              {qa.consistency}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Validity</div>
            <div className={`text-2xl font-bold ${getQualityColor(qa.validity)}`}>
              {qa.validity}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="text-sm text-red-400 mb-1">Critical Issues</div>
            <div className="text-xl font-bold text-red-400">{qa.issues.critical}</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="text-sm text-orange-400 mb-1">High Priority</div>
            <div className="text-xl font-bold text-orange-400">{qa.issues.high}</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
            <div className="text-sm text-yellow-400 mb-1">Medium Priority</div>
            <div className="text-xl font-bold text-yellow-400">{qa.issues.medium}</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="text-sm text-blue-400 mb-1">Low Priority</div>
            <div className="text-xl font-bold text-blue-400">{qa.issues.low}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetectedFields = () => {
    if (!importResult.previewData?.detectedFields) return null;

    return (
      <div className="space-y-3">
        {importResult.previewData.detectedFields.map((field, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="font-medium text-white">{field.originalName}</div>
                {field.cultivationParameter && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Cultivation Parameter
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {field.dataType}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Confidence: {Math.round(field.confidence * 100)}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Suggested Name</div>
                <input
                  type="text"
                  value={fieldMappings[field.originalName] || field.suggestedName}
                  onChange={(e) => setFieldMappings(prev => ({
                    ...prev,
                    [field.originalName]: e.target.value
                  }))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white"
                />
              </div>
              {field.units && (
                <div>
                  <div className="text-gray-400 mb-1">Units</div>
                  <div className="text-white">{field.units}</div>
                </div>
              )}
              <div>
                <div className="text-gray-400 mb-1">Sample Values</div>
                <div className="text-white text-xs">
                  {field.sampleValues.slice(0, 3).map(val => String(val)).join(', ')}
                  {field.sampleValues.length > 3 && '...'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSheetPreview = (sheet: ProcessedData) => {
    const isSelected = selectedSheets.has(sheet.sheetName);
    
    return (
      <div key={sheet.sheetName} className="bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
          onClick={() => toggleSheet(sheet.sheetName)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSheet(sheet.sheetName)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <div className="font-medium text-white">{sheet.sheetName}</div>
                <div className="text-sm text-gray-400">
                  {sheet.cleanedRowCount} rows, {sheet.headers.length} columns
                  {sheet.originalRowCount !== sheet.cleanedRowCount && (
                    <span className="ml-2 text-yellow-400">
                      ({sheet.originalRowCount - sheet.cleanedRowCount} rows cleaned)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-medium ${getQualityColor(sheet.confidence * 100)}`}>
                {Math.round(sheet.confidence * 100)}% confidence
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        {isSelected && (
          <div className="px-4 pb-4 border-t border-gray-700/50">
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-300 mb-2">Headers Preview</div>
              <div className="flex flex-wrap gap-2">
                {sheet.headers.map((header, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>

            {sheet.transformations.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Applied Transformations</div>
                <div className="space-y-1">
                  {sheet.transformations.slice(0, 3).map((transform, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      • {transform}
                    </div>
                  ))}
                  {sheet.transformations.length > 3 && (
                    <div className="text-xs text-gray-400">
                      + {sheet.transformations.length - 3} more transformations...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sample data preview */}
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-300 mb-2">Data Preview</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {sheet.headers.slice(0, 5).map((header, index) => (
                        <th key={index} className="text-left p-2 text-gray-400 font-medium">
                          {header}
                        </th>
                      ))}
                      {sheet.headers.length > 5 && (
                        <th className="text-left p-2 text-gray-400">...</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-gray-800">
                        {row.slice(0, 5).map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-gray-300">
                            {cell !== null && cell !== undefined ? String(cell).substring(0, 20) : '-'}
                          </td>
                        ))}
                        {row.length > 5 && (
                          <td className="p-2 text-gray-400">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIssuesAndRecommendations = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues */}
        <div>
          <h4 className="font-medium text-white mb-3">Issues Found</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {importResult.issues.map((issue, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start space-x-2">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{issue.message}</div>
                    <div className="text-xs opacity-80 mt-1">{issue.location}</div>
                    {issue.suggestion && (
                      <div className="text-xs mt-2 opacity-90">
                        💡 {issue.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-white mb-3">Recommendations</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {importResult.recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(rec.priority)}`}>
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-xs opacity-90 mt-1">{rec.description}</div>
                    <div className="text-xs mt-2 opacity-80">
                      🎯 {rec.action}
                    </div>
                    {rec.automated && (
                      <div className="text-xs mt-1 text-green-400">
                        ✨ Can be automated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleConfirmImport = () => {
    const selectedSheetNames = Array.from(selectedSheets);
    onConfirmImport(selectedSheetNames, fieldMappings);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Data Import Preview</h2>
        <p className="text-gray-400">
          Review your data before importing. You can select which sheets to import and adjust field mappings.
        </p>
      </div>

      {/* Metadata Summary */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Filename</div>
            <div className="font-medium text-white">{importResult.metadata.filename}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Sheets</div>
            <div className="font-medium text-white">{importResult.metadata.totalSheets}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Rows</div>
            <div className="font-medium text-white">{importResult.metadata.totalRows.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Quality Score</div>
            <div className={`font-medium ${getQualityColor(importResult.metadata.qualityScore)}`}>
              {importResult.metadata.qualityScore}/100
            </div>
          </div>
        </div>

        {importResult.metadata.equipmentDetected && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-sm text-blue-400">
              🔧 Equipment Detected: {importResult.metadata.equipmentDetected}
            </div>
          </div>
        )}

        {importResult.metadata.cultivationParameters.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Cultivation Parameters Found</div>
            <div className="flex flex-wrap gap-2">
              {importResult.metadata.cultivationParameters.map((param, index) => (
                <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quality Assessment */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50">
        <button
          onClick={() => toggleSection('quality')}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">Data Quality Assessment</h3>
          {expandedSections.has('quality') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections.has('quality') && (
          <div className="px-4 pb-4">
            {renderQualityAssessment()}
          </div>
        )}
      </div>

      {/* Detected Fields */}
      {importResult.previewData?.detectedFields && (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50">
          <button
            onClick={() => toggleSection('fields')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">
              Detected Fields ({importResult.previewData.detectedFields.length})
            </h3>
            {expandedSections.has('fields') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          {expandedSections.has('fields') && (
            <div className="px-4 pb-4">
              {renderDetectedFields()}
            </div>
          )}
        </div>
      )}

      {/* Sheet Selection */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50">
        <button
          onClick={() => toggleSection('sheets')}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">
            Select Sheets to Import ({selectedSheets.size}/{importResult.data.length})
          </h3>
          {expandedSections.has('sheets') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections.has('sheets') && (
          <div className="px-4 pb-4 space-y-4">
            {importResult.data.map(renderSheetPreview)}
          </div>
        )}
      </div>

      {/* Issues and Recommendations */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50">
        <button
          onClick={() => toggleSection('issues')}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">
            Issues & Recommendations ({importResult.issues.length + importResult.recommendations.length})
          </h3>
          {expandedSections.has('issues') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections.has('issues') && (
          <div className="px-4 pb-4">
            {renderIssuesAndRecommendations()}
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">Advanced Import Options</h3>
          <Settings className="w-5 h-5" />
        </button>
        {showAdvancedOptions && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600" />
                <span className="text-sm text-gray-300">Apply additional data cleaning</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600" />
                <span className="text-sm text-gray-300">Preserve original column names</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600" />
                <span className="text-sm text-gray-300">Create backup of original data</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600" />
                <span className="text-sm text-gray-300">Generate ML-ready features</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel Import
        </button>
        <button
          onClick={() => onRetryWithOptions({})}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Retry with Different Options</span>
        </button>
        <button
          onClick={handleConfirmImport}
          disabled={selectedSheets.size === 0}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Import Selected Data ({selectedSheets.size} sheets)</span>
        </button>
      </div>
    </div>
  );
}