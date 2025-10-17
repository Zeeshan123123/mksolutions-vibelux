'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader, Settings, Download } from 'lucide-react';
import DataImportPreview from './DataImportPreview';
// import type { SmartImportResult, ImportOptions, CultivationContext } from '@/app/api/data/smart-import/route'; // Disabled for static export
type SmartImportResult = any;
type ImportOptions = any;  
type CultivationContext = any;

type ImportStep = 'upload' | 'processing' | 'preview' | 'importing' | 'complete' | 'error';

interface SmartDataImporterProps {
  onImportComplete?: (result: SmartImportResult) => void;
  onError?: (error: string) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  cultivationContext?: Partial<CultivationContext>;
}

export default function SmartDataImporter({
  onImportComplete,
  onError,
  allowedFileTypes = ['.xlsx', '.xls', '.csv'],
  maxFileSize = 50,
  cultivationContext = {}
}: SmartDataImporterProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<SmartImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    autoClean: true,
    preserveOriginal: true,
    cultivationContext: {
      facilityType: 'greenhouse',
      measurementUnits: 'metric',
      ...cultivationContext
    },
    qualityThreshold: 70,
    previewMode: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setError(`File type not supported. Please upload: ${allowedFileTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxFileSize}MB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setCurrentStep('processing');
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('options', JSON.stringify(importOptions));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/data/smart-import', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result: SmartImportResult = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult(result);
      setCurrentStep('preview');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      onError?.(errorMessage);
    }
  };

  const handleConfirmImport = async (selectedSheets: string[], fieldMappings: Record<string, string>) => {
    setCurrentStep('importing');
    setProgress(0);

    try {
      // In a real implementation, this would process the final import
      // For now, we'll simulate the process
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 100));
      }, 300);

      // Simulate API call for final import
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('complete');
      
      if (importResult) {
        onImportComplete?.(importResult);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Final import failed';
      setError(errorMessage);
      setCurrentStep('error');
      onError?.(errorMessage);
    }
  };

  const handleRetryWithOptions = (newOptions: Partial<ImportOptions>) => {
    setImportOptions(prev => ({ ...prev, ...newOptions }));
    setCurrentStep('processing');
    processFile();
  };

  const reset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setProgress(0);
  };

  const renderUploadArea = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10'
            : selectedFile
            ? 'border-green-400 bg-green-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFileTypes.join(',')}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-gray-400" />
          </div>
          
          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
              <div className="font-medium text-white">{selectedFile.name}</div>
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-medium text-white">
                Drag and drop your Excel file here
              </div>
              <div className="text-gray-400">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  browse to select
                </button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            Supported formats: {allowedFileTypes.join(', ')} • Max size: {maxFileSize}MB
          </div>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Import Options</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Facility Type
            </label>
            <select
              value={importOptions.cultivationContext.facilityType || 'greenhouse'}
              onChange={(e) => setImportOptions(prev => ({
                ...prev,
                cultivationContext: {
                  ...prev.cultivationContext,
                  facilityType: e.target.value as any
                }
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="greenhouse">Greenhouse</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Measurement Units
            </label>
            <select
              value={importOptions.cultivationContext.measurementUnits || 'metric'}
              onChange={(e) => setImportOptions(prev => ({
                ...prev,
                cultivationContext: {
                  ...prev.cultivationContext,
                  measurementUnits: e.target.value as any
                }
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Crop Type (Optional)
            </label>
            <input
              type="text"
              value={importOptions.cultivationContext.cropType || ''}
              onChange={(e) => setImportOptions(prev => ({
                ...prev,
                cultivationContext: {
                  ...prev.cultivationContext,
                  cropType: e.target.value
                }
              }))}
              placeholder="e.g., Cannabis, Tomato, Lettuce"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Equipment Vendor (Optional)
            </label>
            <input
              type="text"
              value={importOptions.cultivationContext.equipmentVendor || ''}
              onChange={(e) => setImportOptions(prev => ({
                ...prev,
                cultivationContext: {
                  ...prev.cultivationContext,
                  equipmentVendor: e.target.value
                }
              }))}
              placeholder="e.g., Priva, Argus, TrolMaster"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoClean"
              checked={importOptions.autoClean}
              onChange={(e) => setImportOptions(prev => ({ ...prev, autoClean: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="autoClean" className="text-sm text-gray-300">
              Automatically clean and standardize data
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="preserveOriginal"
              checked={importOptions.preserveOriginal}
              onChange={(e) => setImportOptions(prev => ({ ...prev, preserveOriginal: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="preserveOriginal" className="text-sm text-gray-300">
              Preserve original data structure
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quality Threshold ({importOptions.qualityThreshold}%)
          </label>
          <input
            type="range"
            min="50"
            max="95"
            value={importOptions.qualityThreshold}
            onChange={(e) => setImportOptions(prev => ({ ...prev, qualityThreshold: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="text-xs text-gray-400 mt-1">
            Minimum data quality score required for import
          </div>
        </div>
      </div>

      {selectedFile && (
        <button
          onClick={processFile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Analyze & Preview Import</span>
        </button>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6 py-12">
      <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Processing Your Data</h3>
        <p className="text-gray-400">
          {currentStep === 'processing' 
            ? 'Analyzing file structure and data quality...'
            : 'Importing selected data...'
          }
        </p>
      </div>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-400 mt-2">{progress}% complete</div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6 py-12">
      <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Import Complete!</h3>
        <p className="text-gray-400">
          Your data has been successfully imported and is ready for analysis.
        </p>
      </div>
      {importResult && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Sheets Imported</div>
              <div className="text-white font-medium">{importResult.data.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Total Records</div>
              <div className="text-white font-medium">
                {importResult.data.reduce((sum, sheet) => sum + sheet.cleanedRowCount, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Quality Score</div>
              <div className="text-white font-medium">{importResult.metadata.qualityScore}/100</div>
            </div>
            <div>
              <div className="text-gray-400">Processing Time</div>
              <div className="text-white font-medium">{(importResult.metadata.processingTime / 1000).toFixed(1)}s</div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Import Another File
        </button>
        <button
          onClick={() => onImportComplete?.(importResult!)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Continue to Analysis</span>
        </button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6 py-12">
      <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Import Failed</h3>
        <p className="text-gray-400 max-w-md mx-auto">{error}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
        {selectedFile && (
          <button
            onClick={processFile}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry Processing
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Smart Data Importer</h2>
          <p className="text-gray-400">
            Upload your cultivation data and let our AI-powered system clean, analyze, and prepare it for machine learning.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-8 py-4">
          {[
            { step: 'upload', label: 'Upload' },
            { step: 'processing', label: 'Process' },
            { step: 'preview', label: 'Preview' },
            { step: 'complete', label: 'Complete' }
          ].map(({ step, label }, index) => {
            const isActive = currentStep === step;
            const isCompleted = ['processing', 'preview', 'importing', 'complete'].includes(currentStep) && 
                              ['upload', 'processing', 'preview'].slice(0, index + 1).includes(step);
            
            return (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-700 text-gray-400'}`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
          {currentStep === 'upload' && renderUploadArea()}
          {(currentStep === 'processing' || currentStep === 'importing') && renderProcessing()}
          {currentStep === 'preview' && importResult && (
            <DataImportPreview
              importResult={importResult}
              onConfirmImport={handleConfirmImport}
              onCancel={reset}
              onRetryWithOptions={handleRetryWithOptions}
            />
          )}
          {currentStep === 'complete' && renderComplete()}
          {currentStep === 'error' && renderError()}
        </div>
      </div>
    </div>
  );
}