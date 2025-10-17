'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2, Clock, Package, Grid3X3 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { exportDesign } from '@/lib/lighting-design';
import { ExcelReportGenerator } from '@/lib/reports/excel-generator';
import { professionalCADEngine } from '@/lib/cad/professional-dxf-dwg-engine';

interface Project {
  id: string;
  name: string;
  room: any;
  fixtures: any[];
  config: any;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'templates' | 'export' | 'share';
  projects: Project[];
  currentProject: Project | null;
  designState: any;
  powerMetrics: any;
  heatmapData: any[];
  spectrumData: any[];
  onLoadProject: (project: Project) => void;
}

const templates = [
  {
    id: 'veg-tent-4x4',
    name: '4x4 Veg Tent',
    description: 'Optimized for vegetative growth in a 4x4 tent',
    room: { dimensions: { length: 4, width: 4, height: 7 }, unit: 'feet' },
    fixtures: [],
    fixtureCount: 1,
    targetPPFD: 400
  },
  {
    id: 'flower-tent-4x8',
    name: '4x8 Flower Tent',
    description: 'High-intensity setup for flowering in a 4x8 tent',
    room: { dimensions: { length: 8, width: 4, height: 7 }, unit: 'feet' },
    fixtures: [],
    fixtureCount: 2,
    targetPPFD: 800
  },
  {
    id: 'commercial-20x40',
    name: '20x40 Commercial',
    description: 'Commercial grow room with multiple zones',
    room: { dimensions: { length: 40, width: 20, height: 12 }, unit: 'feet' },
    fixtures: [],
    fixtureCount: 16,
    targetPPFD: 700
  },
  {
    id: 'greenhouse-30x60',
    name: '30x60 Greenhouse',
    description: 'Supplemental lighting for greenhouse',
    room: { dimensions: { length: 60, width: 30, height: 14 }, unit: 'feet' },
    fixtures: [],
    fixtureCount: 24,
    targetPPFD: 500
  }
];

export default function ProjectManagementModal({
  isOpen,
  onClose,
  activeTab,
  projects,
  currentProject,
  designState,
  powerMetrics,
  heatmapData,
  spectrumData,
  onLoadProject
}: ProjectManagementModalProps) {
  const handleExport = async (format: 'json' | 'dwg' | 'excel') => {
    try {
      const exportData = await exportDesign({
        room: designState.room,
        fixtures: designState.fixtures,
        metrics: powerMetrics,
        heatmap: heatmapData,
        spectrum: spectrumData,
        format
      });
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibelux-design-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      
      
      if (format === 'dwg') {
        // Build a professional CAD drawing and export DXF with Vibelux title block
        const drawing = {
          header: {
            version: 'AC1024',
            units: 'inches',
            precision: 4,
            extMin: { x: 0, y: 0, z: 0 },
            extMax: { x: 0, y: 0, z: 0 },
            limMin: { x: 0, y: 0 },
            limMax: { x: 0, y: 0 },
            createdBy: 'Vibelux Professional CAD Engine',
            lastModified: new Date()
          },
          layers: [],
          blocks: [],
          entities: [],
          paperSpace: [],
          metadata: {
            projectName: currentProject?.name || 'Vibelux Design',
            drawingNumber: 'E-101',
            revision: 'A',
            drawnBy: 'Vibelux',
            checkedBy: '',
            approvedBy: '',
            scale: '1/4" = 1\'-0"',
            plotStyle: 'Vibelux Standard',
            compliance: ['NEC 2023']
          }
        } as any;

        // Convert room outline and fixtures into professional CAD entities
        const entities: any[] = [];
        const roomWidth = Number(designState?.room?.dimensions?.width || 0);
        const roomLength = Number(designState?.room?.dimensions?.length || 0);
        if (roomWidth > 0 && roomLength > 0) {
          entities.push({
            handle: 'RM001',
            type: 'POLYLINE',
            layer: 'A-WALL-FULL',
            color: 7,
            lineWeight: 0.024,
            geometry: {
              vertices: [
                { x: 0, y: 0 },
                { x: roomWidth, y: 0 },
                { x: roomWidth, y: roomLength },
                { x: 0, y: roomLength },
                { x: 0, y: 0 }
              ],
              closed: true
            },
            userData: {}
          });
        }

        const fixtures = Array.isArray(designState?.fixtures) ? designState.fixtures : [];
        fixtures.forEach((f: any, idx: number) => {
          const cx = Number(f?.position?.x || 0);
          const cy = Number(f?.position?.y || 0);
          const w = Number(f?.model?.dimensions?.width || 2);
          const l = Number(f?.model?.dimensions?.length || 2);
          const rot = Number(f?.rotation || 0) * Math.PI / 180;
          const halfW = w / 2;
          const halfL = l / 2;
          const corners = [
            { x: -halfW, y: -halfL },
            { x: halfW, y: -halfL },
            { x: halfW, y: halfL },
            { x: -halfW, y: halfL }
          ].map(pt => ({
            x: cx + (pt.x * Math.cos(rot) - pt.y * Math.sin(rot)),
            y: cy + (pt.x * Math.sin(rot) + pt.y * Math.cos(rot))
          }));

          entities.push({
            handle: `FX${String(idx + 1).padStart(3, '0')}`,
            type: 'POLYLINE',
            layer: 'E-LITE',
            color: 256,
            lineWeight: 0.012,
            geometry: { vertices: [...corners, corners[0]], closed: true },
            userData: { model: f?.model?.model || f?.model?.name || 'Fixture' }
          });
        });

        drawing.entities = entities;
        
        // Export DXF via professional engine (adds title block and standards)
        const dxfContent = professionalCADEngine.exportDXF(drawing, {
          format: 'DXF',
          version: 'R2018',
          units: 'inches',
          precision: 4,
          coordinateSystem: 'model'
        });

        const blob = new Blob([dxfContent], { type: 'application/dxf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibelux-design-${Date.now()}.dxf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      if (format === 'excel') {
        const generator = new ExcelReportGenerator({ title: 'VibeLux Design Data' });
        const buffer = await generator.generateReport([
          {
            name: 'Summary',
            headers: ['Metric', 'Value'],
            rows: [
              ['Room Length', designState.room.dimensions.length],
              ['Room Width', designState.room.dimensions.width],
              ['Fixtures', designState.fixtures.length],
              ['Total Power (W)', powerMetrics?.totalPower || 0],
            ],
            autoFilter: true,
          },
          {
            name: 'Fixtures',
            headers: ['ID','Model','Wattage','X','Y','Rotation'],
            rows: (designState.fixtures || []).map((f: any) => [
              f.id,
              f.model?.model || '',
              f.model?.wattage || 0,
              f.position?.x || 0,
              f.position?.y || 0,
              f.rotation || 0,
            ]),
          }
        ]);
        const url = URL.createObjectURL(new Blob([buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibelux-design-${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: 'Export Complete',
        description: `Your design has been exported as ${format.toUpperCase()}.`
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export your design.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared/${currentProject?.id || 'temp'}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link Copied',
      description: 'Share link has been copied to clipboard.'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Project Management</DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage templates, export your design, or share with others
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="border-gray-700 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{template.name}</CardTitle>
                      <Badge variant="secondary">
                        {template.fixtureCount} fixtures
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                          <Grid3X3 className="w-4 h-4" />
                          {template.room.dimensions.length}x{template.room.dimensions.width} {template.room.unit}
                        </span>
                        <span>Target: {template.targetPPFD} PPFD</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onLoadProject({
                          id: template.id,
                          name: template.name,
                          room: template.room,
                          fixtures: template.fixtures,
                          config: { spaceType: 'indoor', ...template.room, includeCAD: false },
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          version: 1
                        })}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {projects.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-6 mb-3">Recent Projects</h3>
                <div className="space-y-2">
                  {projects.slice(0, 5).map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadProject(project)}
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="export" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">JSON Export</CardTitle>
                  <CardDescription>Export design data for backup or sharing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleExport('json')} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">PDF Report</CardTitle>
                  <CardDescription>Generate a professional PDF report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleExport('pdf')} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">CAD Export (DXF)</CardTitle>
                  <CardDescription>Export to DXF format for CAD software</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleExport('dwg')} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as DXF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Excel Report</CardTitle>
                  <CardDescription>Export data tables to Excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleExport('excel')} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as Excel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="share" className="mt-4">
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Share Your Design</CardTitle>
                <CardDescription>
                  Generate a shareable link for your design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Share Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/shared/${currentProject?.id || 'temp'}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                    <Button onClick={handleShare}>
                      Copy Link
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">View Only</p>
                    <p className="text-xs text-gray-400">Others can view but not edit</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg opacity-50">
                    <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Collaborate</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}