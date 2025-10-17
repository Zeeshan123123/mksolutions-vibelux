'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Download,
  Settings,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { drawingParser } from '@/lib/drawing/parser';
import { layoutGenerator } from '@/lib/drawing/layoutGenerator';
import {
  ParsedDrawing,
  CultivationLayout,
  DrawingParseOptions,
  DrawingValidation
} from '@/lib/drawing/types';
import { Layout3DVisualizer } from './Layout3DVisualizer';
import { createDesignerURL, exportLayoutToJSON } from '@/lib/drawing/layoutConverter';

interface DrawingImportProps {
  onLayoutGenerated?: (layout: CultivationLayout) => void;
  onDrawingParsed?: (drawing: ParsedDrawing) => void;
}

export function DrawingImport({ onLayoutGenerated, onDrawingParsed }: DrawingImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [parsedDrawing, setParsedDrawing] = useState<ParsedDrawing | null>(null);
  const [generatedLayout, setGeneratedLayout] = useState<CultivationLayout | null>(null);
  const [validation, setValidation] = useState<DrawingValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);

  const parseOptions: DrawingParseOptions = {
    detectDimensions: true,
    detectText: true,
    detectTables: true,
    unit: 'ft',
    enhanceContrast: true
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Parse drawing
      setCurrentStep('Parsing drawing...');
      setProgress(20);

      let parsed: ParsedDrawing;
      if (file.type === 'application/pdf') {
        parsed = await drawingParser.parsePDF(file, parseOptions);
      } else if (file.type.startsWith('image/')) {
        parsed = await drawingParser.parseImage(file, parseOptions);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      setParsedDrawing(parsed);
      onDrawingParsed?.(parsed);
      setProgress(50);

      // Step 2: Generate layout
      if (parsed.rooms.length > 0) {
        setCurrentStep('Generating optimized layout...');
        setProgress(70);

        const layout = await layoutGenerator.generateLayout(parsed.rooms[0], {
          tableType: 'rolling',
          lightType: 'led',
          targetPPFD: 700,
          complianceMode: 'standard'
        });

        setGeneratedLayout(layout);
        onLayoutGenerated?.(layout);
        setProgress(90);

        // Step 3: Validate layout
        setCurrentStep('Validating layout...');
        const validationResult = layoutGenerator.validateLayout(layout);
        setValidation(validationResult);
        setProgress(100);

        setCurrentStep('Complete!');
      } else {
        throw new Error('No rooms detected in the drawing. Please ensure dimensions are visible.');
      }

    } catch (err) {
      console.error('Error processing drawing:', err);
      setError(err.message || 'Failed to process drawing');
    } finally {
      setIsProcessing(false);
    }
  }, [onLayoutGenerated, onDrawingParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const renderResults = () => {
    if (!parsedDrawing || !generatedLayout) return null;

    return (
      <div className="space-y-6 mt-8">
        {/* Parsed Drawing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Parsed Drawing</span>
              <Badge variant={parsedDrawing.confidence > 0.8 ? 'default' : 'secondary'}>
                {Math.round(parsedDrawing.confidence * 100)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Rooms Detected</p>
                <p className="text-2xl font-bold">{parsedDrawing.rooms.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-2xl font-bold">
                  {parsedDrawing.totalArea.toLocaleString()} sq ft
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scale</p>
                <p className="text-2xl font-bold">1:{parsedDrawing.scale}</p>
              </div>
            </div>

            {parsedDrawing.rooms.map((room, index) => (
              <div key={room.id} className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{room.name || `Room ${index + 1}`}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {room.dimensions.width}' × {room.dimensions.height}' = {room.area.toLocaleString()} sq ft
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Generated Layout Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tables</p>
                <p className="text-2xl font-bold">{generatedLayout.metrics.tableCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plant Capacity</p>
                <p className="text-2xl font-bold">
                  {generatedLayout.metrics.plantCapacity.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Canopy Coverage</p>
                <p className="text-2xl font-bold">
                  {generatedLayout.metrics.utilizationRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Power Density</p>
                <p className="text-2xl font-bold">
                  {generatedLayout.metrics.powerDensity.toFixed(1)} W/sq ft
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lighting</span>
                <span className="text-sm text-gray-600">
                  {generatedLayout.lights.length} fixtures @ {generatedLayout.metrics.ppfdAverage} PPFD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HVAC</span>
                <span className="text-sm text-gray-600">
                  {generatedLayout.hvac.filter(h => h.type === 'ac').length} AC units, 
                  {generatedLayout.hvac.filter(h => h.type === 'dehumidifier').length} dehumidifiers
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Irrigation</span>
                <span className="text-sm text-gray-600">
                  {generatedLayout.irrigation.length} zones, 
                  {generatedLayout.tables.length * 50} GPD capacity
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {validation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validation.isValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Layout Validation Passed
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Layout Validation Issues
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validation.errors.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-red-600">Errors</h4>
                  {validation.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{error.code}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-yellow-600">Warnings</h4>
                  {validation.warnings.map((warning, index) => (
                    <Alert key={index}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{warning.code}</AlertTitle>
                      <AlertDescription>{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Suggestions</h4>
                  {validation.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium">{suggestion.message}</p>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.implementation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => setShow3D(!show3D)}>
            <Eye className="w-4 h-4 mr-2" />
            {show3D ? 'Hide' : 'Show'} 3D View
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (generatedLayout) {
                const url = createDesignerURL(generatedLayout);
                window.open(url, '_blank');
              }
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit in Designer
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (generatedLayout) {
                const json = exportLayoutToJSON(generatedLayout);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${generatedLayout.room.name || 'layout'}_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Layout
          </Button>
        </div>

        {/* 3D Visualization */}
        {show3D && generatedLayout && (
          <Layout3DVisualizer
            layout={generatedLayout}
            onEditInDesigner={() => {
              const url = createDesignerURL(generatedLayout);
              window.open(url, '_blank');
            }}
            onExport={() => {
              const json = exportLayoutToJSON(generatedLayout);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${generatedLayout.room.name || 'layout'}_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
                <p className="text-lg font-medium">{currentStep}</p>
                <Progress value={progress} className="max-w-xs mx-auto" />
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-4 mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your facility drawing here
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Supports PDF floor plans and images (PNG, JPG)
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Maximum file size: 50MB
                </p>
                <Button className="mt-6">
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </>
            )}
          </div>

          {/* Example drawings */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Example Formats:</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <FileText className="w-8 h-8 mx-auto text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">CAD PDF Export</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <Image className="w-8 h-8 mx-auto text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">Hand Drawing Photo</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <Maximize2 className="w-8 h-8 mx-auto text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">Floor Plan Image</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {renderResults()}
    </div>
  );
}