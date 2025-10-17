'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { ParsedDrawing } from '@/lib/drawing/parser';
import { GeneratedLayout } from '@/lib/drawing/layoutGenerator';
import { LightingDesign } from '@/lib/drawing/lightingOptimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  ArrowRight,
  Zap,
  DollarSign,
  BarChart3,
  Layers
} from 'lucide-react';

interface ImportedDrawingProcessorProps {
  parsedDrawing: ParsedDrawing;
  generatedLayout: GeneratedLayout;
  lightingDesign: LightingDesign;
  onProcessComplete?: () => void;
}

export function ImportedDrawingProcessor({
  parsedDrawing,
  generatedLayout,
  lightingDesign,
  onProcessComplete
}: ImportedDrawingProcessorProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate key metrics
  const totalFixtures = lightingDesign.lights.length;
  const totalPower = lightingDesign.totalPower;
  const averagePPFD = lightingDesign.metrics.averagePPFD;
  const roi = lightingDesign.financial.roiYears;

  const openInAdvancedDesigner = async () => {
    setIsProcessing(true);
    try {
      // Convert to advanced designer format
      const designData = {
        room: {
          dimensions: {
            length: parsedDrawing.dimensions.length,
            width: parsedDrawing.dimensions.width,
            height: parsedDrawing.dimensions.height || 10
          },
          unit: parsedDrawing.dimensions.unit || 'feet'
        },
        fixtures: lightingDesign.lights.map((light, index) => ({
          id: `fixture-${Date.now()}-${index}`,
          position: {
            x: (light.x / parsedDrawing.dimensions.width) * 100, // Convert to percentage
            y: (light.y / parsedDrawing.dimensions.length) * 100,
            z: light.z || 8
          },
          rotation: 0,
          model: {
            id: light.fixture.toLowerCase().replace(/\s+/g, '-'),
            name: light.fixture,
            manufacturer: 'Fluence',
            specifications: {
              power: lightingDesign.lights[0]?.wattage || 645,
              ppf: lightingDesign.lights[0]?.ppf || 1700,
              coverage: 16,
              spectrum: 'full'
            }
          }
        })),
        importData: {
          source: parsedDrawing.metadata?.fileName || 'Imported Drawing',
          roomName: parsedDrawing.metadata?.roomName || 'Boundary Cone',
          tables: generatedLayout.tables,
          originalDesign: lightingDesign
        }
      };

      // Save to localStorage for the advanced designer to pick up
      localStorage.setItem('vibelux_imported_design', JSON.stringify(designData));
      localStorage.setItem('vibelux_import_timestamp', Date.now().toString());

      // Navigate to advanced designer
      router.push('/design/advanced?imported=true');
      
      toast({
        title: 'Opening Advanced Designer',
        description: 'Your imported design is being loaded...'
      });

      onProcessComplete?.();
    } catch (error) {
      console.error('Failed to process design:', error);
      toast({
        title: 'Processing Failed',
        description: 'Could not prepare design for advanced editor',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateQuickReport = () => {
    const report = {
      project: {
        name: parsedDrawing.metadata?.roomName || 'Imported Facility',
        date: new Date().toISOString(),
        source: 'Vibelux Drawing Import System'
      },
      facility: {
        dimensions: parsedDrawing.dimensions,
        area: parsedDrawing.area,
        roomCount: parsedDrawing.rooms.length
      },
      layout: {
        tables: generatedLayout.tables.length,
        canopyArea: generatedLayout.totalCanopyArea,
        utilization: generatedLayout.utilizationRate
      },
      lighting: {
        fixtures: lightingDesign.lights.length,
        model: lightingDesign.lights[0]?.fixture || 'SPYDR 2p',
        totalPower: lightingDesign.totalPower,
        averagePPFD: lightingDesign.metrics.averagePPFD,
        uniformity: lightingDesign.metrics.uniformity
      },
      financial: {
        equipmentCost: lightingDesign.financial.equipmentCost,
        installationCost: lightingDesign.financial.installationCost,
        annualSavings: lightingDesign.financial.annualSavings,
        roi: lightingDesign.financial.roiYears
      }
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Generated',
      description: 'Quick report downloaded successfully'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Drawing Import Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Fixtures</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalFixtures}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Avg PPFD</span>
              </div>
              <p className="text-2xl font-bold text-white">{averagePPFD.toFixed(0)} μmol/m²/s</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Total Power</span>
              </div>
              <p className="text-2xl font-bold text-white">{(totalPower / 1000).toFixed(1)} kW</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">ROI</span>
              </div>
              <p className="text-2xl font-bold text-white">{roi.toFixed(1)} years</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={openInAdvancedDesigner}
              disabled={isProcessing}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Layers className="w-4 h-4 mr-2" />
              Open in Advanced Designer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={generateQuickReport}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Quick Report
            </Button>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Open in Advanced Designer for detailed analysis and professional reports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Generate heat maps, spectrum analysis, and DLI optimization
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Export as PDF, DWG, or Excel for contractors and clients
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Calculate detailed ROI with energy savings and yield predictions
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImportedDrawingProcessor;