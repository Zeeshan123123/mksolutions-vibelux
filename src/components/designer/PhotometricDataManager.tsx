import React, { useState, useCallback } from 'react';
import { Upload, FileText, BarChart3, Eye, Download, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IESParser, IESData } from '@/lib/photometrics/iesParser';
import { PhotometricAnalysis } from '@/lib/photometrics/photometricAnalysis';
import { useToast } from '@/components/ui/use-toast';

interface PhotometricDataManagerProps {
  onDataLoaded?: (fixtureType: string, data: IESData) => void;
  fixtures?: any[];
}

export default function PhotometricDataManager({ 
  onDataLoaded,
  fixtures = []
}: PhotometricDataManagerProps) {
  const [loading, setLoading] = useState(false);
  const [iesData, setIesData] = useState<Map<string, IESData>>(new Map());
  const [selectedFixture, setSelectedFixture] = useState<string>('');
  const [polarData, setPolarData] = useState<any>(null);
  const { toast } = useToast();
  
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.ies')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an IES file (.ies)',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    try {
      const content = await file.text();
      const data = await IESParser.parse(content);
      
      // Use filename without extension as fixture type
      const fixtureType = file.name.replace('.ies', '');
      
      // Update state
      const newData = new Map(iesData);
      newData.set(fixtureType, data);
      setIesData(newData);
      
      // Notify parent
      if (onDataLoaded) {
        onDataLoaded(fixtureType, data);
      }
      
      toast({
        title: 'IES file loaded',
        description: `Photometric data for ${fixtureType} loaded successfully`
      });
      
      // Generate polar distribution
      const analysis = new PhotometricAnalysis();
      await analysis.loadIESFile(fixtureType, content);
      const distribution = analysis.generatePolarDistribution(fixtureType);
      setPolarData({ fixtureType, distribution });
      
    } catch (error) {
      console.error('Error parsing IES file:', error);
      toast({
        title: 'Error loading file',
        description: 'Failed to parse IES file. Please check the file format.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [iesData, onDataLoaded, toast]);
  
  const generateSampleIES = useCallback(() => {
    const sampleData: IESData = {
      testLabName: 'Vibelux Testing Laboratory',
      testReportNumber: 'VLX-2025-001',
      luminaireCatalogNumber: 'SPYDR-2P-645',
      luminaireDescription: 'SPYDR 2p LED Grow Light',
      lampCatalogNumber: 'LED-645W',
      lampDescription: 'High Efficiency LED Array',
      numberOfLamps: 1,
      lumensPerLamp: 65000,
      totalLumens: 65000,
      multiplier: 1,
      width: 1.07,
      length: 1.07,
      height: 0.076,
      verticalAngles: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
      horizontalAngles: [0, 45, 90, 135, 180, 225, 270, 315],
      candelaValues: [
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0],
        [8000, 7950, 7800, 7550, 7200, 6750, 6200, 5550, 4800, 3950, 3000, 2050, 1000, 500, 250, 100, 50, 25, 0]
      ],
      maxCandela: 8000,
      beamAngle: 120,
      fieldAngle: 140,
      efficacy: 100.7,
      coneOfLight: {
        angle: 120,
        diameter: 5.2,
        coverage: 21.2
      }
    };
    
    const fixtureType = 'SPYDR-2P-Sample';
    const newData = new Map(iesData);
    newData.set(fixtureType, sampleData);
    setIesData(newData);
    
    if (onDataLoaded) {
      onDataLoaded(fixtureType, sampleData);
    }
    
    toast({
      title: 'Sample IES data generated',
      description: 'You can now use this data for photometric analysis'
    });
  }, [iesData, onDataLoaded, toast]);
  
  const downloadIES = useCallback((fixtureType: string) => {
    const data = iesData.get(fixtureType);
    if (!data) return;
    
    const content = IESParser.generate(data);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fixtureType}.ies`;
    a.click();
    URL.revokeObjectURL(url);
  }, [iesData]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Photometric Data Manager</CardTitle>
        <CardDescription>
          Import and manage IES photometric files for accurate lighting calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload IES</TabsTrigger>
            <TabsTrigger value="library">Data Library</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Upload IES photometric data files for your fixtures
              </p>
              <div className="flex gap-4 justify-center">
                <label>
                  <input
                    type="file"
                    accept=".ies"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <Button variant="outline" disabled={loading}>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose IES File
                  </Button>
                </label>
                <Button
                  variant="secondary"
                  onClick={generateSampleIES}
                  disabled={loading}
                >
                  Generate Sample
                </Button>
              </div>
              {loading && (
                <div className="mt-4">
                  <Progress value={50} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Processing file...</p>
                </div>
              )}
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                IES files contain standardized photometric data including light distribution,
                intensity, and beam angles. This data enables accurate lighting simulation
                and PPFD calculations.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            {iesData.size === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  No photometric data loaded yet.
                  Upload IES files to build your library.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(iesData.entries()).map(([type, data]) => (
                  <div
                    key={type}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedFixture(type)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{type}</h4>
                        <p className="text-sm text-gray-600">
                          {data.luminaireDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadIES(type);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Power:</span>
                        <span className="ml-1 font-medium">
                          {data.numberOfLamps * (data.lumensPerLamp / 100)}W
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Beam:</span>
                        <span className="ml-1 font-medium">{data.beamAngle}°</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficacy:</span>
                        <span className="ml-1 font-medium">
                          {data.efficacy.toFixed(1)} lm/W
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            {selectedFixture && iesData.get(selectedFixture) ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Fixture Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Model</p>
                      <p className="font-medium">{selectedFixture}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Lumens</p>
                      <p className="font-medium">
                        {iesData.get(selectedFixture)!.totalLumens.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max Intensity</p>
                      <p className="font-medium">
                        {iesData.get(selectedFixture)!.maxCandela.toLocaleString()} cd
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Coverage at 3ft</p>
                      <p className="font-medium">
                        {iesData.get(selectedFixture)!.coneOfLight.coverage.toFixed(1)} ft²
                      </p>
                    </div>
                  </div>
                </div>
                
                {polarData && polarData.fixtureType === selectedFixture && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Polar Distribution</h4>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                      <BarChart3 className="h-12 w-12 text-gray-400" />
                      <p className="ml-2 text-sm text-gray-600">
                        Polar chart visualization
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  Select a fixture from the library to view detailed analysis
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}