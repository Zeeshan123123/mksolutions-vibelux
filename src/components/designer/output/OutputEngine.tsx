'use client';

import { useState } from 'react';
import { logger } from '@/lib/client-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Download, 
  Image, 
  Share2, 
  Mail, 
  Printer, 
  Settings,
  Eye,
  BarChart3,
  Camera,
  FileSpreadsheet,
  FileImage,
  FileCode,
  Clock,
  Building,
  Calculator,
  Lightbulb,
  Zap,
  Target,
  CheckCircle
} from 'lucide-react';

interface OutputEngineProps {
  placedFixtures: any[];
  analysisResults?: any;
  simulationResults?: any;
  roomDimensions: {
    length: number;
    width: number;
    height: number;
  };
  projectName: string;
}

interface ReportSection {
  id: string;
  name: string;
  description: string;
  icon: any;
  included: boolean;
  required?: boolean;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  fileType: string;
}

export function OutputEngine({
  placedFixtures,
  analysisResults,
  simulationResults,
  roomDimensions,
  projectName
}: OutputEngineProps) {
  const [selectedTab, setSelectedTab] = useState('reports');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [reportSettings, setReportSettings] = useState({
    title: projectName || 'Lighting Design Report',
    clientName: '',
    projectLocation: '',
    designerName: '',
    companyName: 'VibeLux',
    includeExecutiveSummary: true,
    includeTechnicalSpecs: true,
    includeAnalysis: true,
    includeRecommendations: true,
    includeCostEstimate: false,
    includeMaintenanceSchedule: false,
    reportFormat: 'professional', // 'professional', 'technical', 'summary'
    branding: true
  });

  const reportSections: ReportSection[] = [
    {
      id: 'cover',
      name: 'Cover Page',
      description: 'Project title, client info, and company branding',
      icon: FileText,
      included: true,
      required: true
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview and key findings',
      icon: BarChart3,
      included: reportSettings.includeExecutiveSummary
    },
    {
      id: 'project-overview',
      name: 'Project Overview',
      description: 'Room specifications and design requirements',
      icon: Building,
      included: true,
      required: true
    },
    {
      id: 'fixture-schedule',
      name: 'Fixture Schedule',
      description: 'Detailed list of all fixtures and specifications',
      icon: Lightbulb,
      included: true,
      required: true
    },
    {
      id: 'layout-drawings',
      name: 'Layout Drawings',
      description: '2D and 3D views of the lighting layout',
      icon: Image,
      included: true,
      required: true
    },
    {
      id: 'photometric-analysis',
      name: 'Photometric Analysis',
      description: 'PPFD calculations, uniformity, and distribution',
      icon: Calculator,
      included: reportSettings.includeAnalysis && !!analysisResults
    },
    {
      id: 'energy-analysis',
      name: 'Energy Analysis',
      description: 'Power consumption, efficiency, and operating costs',
      icon: Zap,
      included: reportSettings.includeAnalysis && !!analysisResults
    },
    {
      id: 'simulation-results',
      name: 'Simulation Results',
      description: 'Time-based performance and environmental impact',
      icon: Clock,
      included: !!simulationResults
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Design optimization suggestions',
      icon: Target,
      included: reportSettings.includeRecommendations
    },
    {
      id: 'cost-estimate',
      name: 'Cost Estimate',
      description: 'Equipment costs and installation estimates',
      icon: FileSpreadsheet,
      included: reportSettings.includeCostEstimate
    },
    {
      id: 'maintenance',
      name: 'Maintenance Schedule',
      description: 'Fixture maintenance and replacement timeline',
      icon: Settings,
      included: reportSettings.includeMaintenanceSchedule
    },
    {
      id: 'appendices',
      name: 'Technical Appendices',
      description: 'Detailed specifications and calculations',
      icon: FileCode,
      included: reportSettings.includeTechnicalSpecs
    }
  ];

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional PDF document with all sections',
      icon: FileText,
      fileType: 'application/pdf'
    },
    {
      id: 'excel',
      name: 'Excel Workbook',
      description: 'Spreadsheet with calculations and fixture data',
      icon: FileSpreadsheet,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      id: 'images',
      name: 'Image Package',
      description: 'High-resolution layout and analysis images',
      icon: FileImage,
      fileType: 'application/zip'
    },
    {
      id: 'cad',
      name: 'CAD Files',
      description: 'DWG/DXF files for construction',
      icon: FileCode,
      fileType: 'application/zip'
    },
    {
      id: 'ies',
      name: 'IES Files',
      description: 'Photometric data for lighting software',
      icon: Calculator,
      fileType: 'application/zip'
    }
  ];

  const handleSectionToggle = (sectionId: string, included: boolean) => {
    // Update report sections
    const section = reportSections.find(s => s.id === sectionId);
    if (section && !section.required) {
      section.included = included;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate report generation progress
      const includedSections = reportSections.filter(s => s.included);
      const progressStep = 100 / includedSections.length;

      for (let i = 0; i < includedSections.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setGenerationProgress((i + 1) * progressStep);
      }

      // In real implementation, this would:
      // 1. Generate PDF using a library like jsPDF or Puppeteer
      // 2. Create Excel files with calculations
      // 3. Export CAD files
      // 4. Package everything for download

      alert('Report generated successfully! In a real implementation, this would download the files.');

    } catch (error) {
      logger.error('system', 'Report generation failed:', error );
      alert('Report generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const exportFormat = async (format: ExportFormat) => {
    setIsGenerating(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would generate and download the specific format
      alert(`${format.name} export completed! File would be downloaded in a real implementation.`);
      
    } catch (error) {
      logger.error('system', 'Export failed:', error );
      alert('Export failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareReport = async (method: 'email' | 'link' | 'cloud') => {
    // In real implementation, this would:
    // - Email: Send report via email
    // - Link: Generate shareable link
    // - Cloud: Upload to cloud storage
    alert(`Share via ${method} functionality would be implemented here.`);
  };

  const previewReport = () => {
    // In real implementation, this would open a modal with report preview
    alert('Report preview would open in a new window.');
  };

  if (placedFixtures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Design to Export</h3>
          <p className="text-gray-500">Create a lighting design first to generate reports and outputs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Reports & Export
            </h2>
            <p className="text-sm text-gray-400">
              Generate professional reports and export design files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={previewReport} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
        {isGenerating && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>Generating report sections...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none p-0">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Professional Reports
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              File Exports
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share & Collaborate
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="reports" className="space-y-6 m-0">
              {/* Report Settings */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Report Title</Label>
                      <Input
                        value={reportSettings.title}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Client Name</Label>
                      <Input
                        value={reportSettings.clientName}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Project Location</Label>
                      <Input
                        value={reportSettings.projectLocation}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, projectLocation: e.target.value }))}
                        placeholder="City, State/Country"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Designer Name</Label>
                      <Input
                        value={reportSettings.designerName}
                        onChange={(e) => setReportSettings(prev => ({ ...prev, designerName: e.target.value }))}
                        placeholder="Your name"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Report Format</Label>
                    <select
                      value={reportSettings.reportFormat}
                      onChange={(e) => setReportSettings(prev => ({ ...prev, reportFormat: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                    >
                      <option value="professional">Professional (Detailed)</option>
                      <option value="technical">Technical (Engineering Focus)</option>
                      <option value="summary">Executive Summary (Brief)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Report Sections */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Report Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportSections.map((section) => (
                      <div
                        key={section.id}
                        className={`p-4 rounded-lg border ${
                          section.included 
                            ? 'border-blue-600 bg-blue-900/20' 
                            : 'border-gray-600 bg-gray-700/20'
                        } ${section.required ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <section.icon className="w-5 h-5 text-blue-400" />
                              <h4 className="font-medium">{section.name}</h4>
                              {section.required && (
                                <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{section.description}</p>
                          </div>
                          <div className="ml-3">
                            <Checkbox
                              checked={section.included}
                              onCheckedChange={(checked) => 
                                handleSectionToggle(section.id, checked as boolean)
                              }
                              disabled={section.required}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Report Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {reportSections.filter(s => s.included).length}
                      </div>
                      <div className="text-sm text-gray-400">Sections</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {placedFixtures.length}
                      </div>
                      <div className="text-sm text-gray-400">Fixtures</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {analysisResults ? '1' : '0'}
                      </div>
                      <div className="text-sm text-gray-400">Analysis</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">
                        ~{Math.max(10, reportSections.filter(s => s.included).length * 2)}
                      </div>
                      <div className="text-sm text-gray-400">Pages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exports" className="space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportFormats.map((format) => (
                  <Card key={format.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <format.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">{format.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{format.description}</p>
                        <Button
                          onClick={() => exportFormat(format)}
                          disabled={isGenerating}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Image Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Resolution:</span>
                          <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1">
                            <option>High (300 DPI)</option>
                            <option>Medium (150 DPI)</option>
                            <option>Low (72 DPI)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Format:</span>
                          <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1">
                            <option>PNG</option>
                            <option>JPEG</option>
                            <option>SVG</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">CAD Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Units:</span>
                          <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1">
                            <option>Metric (mm)</option>
                            <option>Imperial (inches)</option>
                            <option>Feet</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Version:</span>
                          <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1">
                            <option>AutoCAD 2021</option>
                            <option>AutoCAD 2018</option>
                            <option>DXF R14</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="share" className="space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email Report</h3>
                    <p className="text-sm text-gray-400 mb-4">Send report directly to client or team members</p>
                    <Button
                      onClick={() => shareReport('email')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Send Email
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Share2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Shareable Link</h3>
                    <p className="text-sm text-gray-400 mb-4">Generate a secure link for easy sharing</p>
                    <Button
                      onClick={() => shareReport('link')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Create Link
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Cloud Storage</h3>
                    <p className="text-sm text-gray-400 mb-4">Upload to Google Drive, Dropbox, or OneDrive</p>
                    <Button
                      onClick={() => shareReport('cloud')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Upload
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Collaboration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">Project Access</Label>
                    <select className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm">
                      <option>Private (Owner only)</option>
                      <option>Team Access (Edit permissions)</option>
                      <option>Client View (Read only)</option>
                      <option>Public Link (Anyone with link)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Collaboration Notes</Label>
                    <Textarea
                      placeholder="Add notes for team members or clients..."
                      className="bg-gray-700 border-gray-600 mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Allow Comments</Label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Email Notifications</Label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Download Tracking</Label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Version History</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}