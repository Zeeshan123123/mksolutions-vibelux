'use client';

import React, { useState, useEffect } from 'react';
import { ComprehensiveFacilityDesigner } from '@/components/facility/ComprehensiveFacilityDesigner';
import ComprehensiveFacilityReportBuilder from '@/components/reports/ComprehensiveFacilityReportBuilder';
import langeGreenhouseConfig from '../lange-config';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function LangeGreenhouseDesignPage() {
  const [showReport, setShowReport] = useState(false);
  const [facilityData, setFacilityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the configuration
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleConfigChange = (config: any) => {
    // Merge the config with Lange specifications
    const mergedData = {
      ...config,
      projectInfo: {
        name: "Lange Group Commercial Greenhouse Facility",
        client: "Lange Group",
        location: "Brochton, Illinois 61617",
        date: new Date().toISOString(),
        proposalNumber: "VLX-16375-01",
        designer: "Vibelux Design System"
      },
      specifications: langeGreenhouseConfig
    };
    setFacilityData(mergedData);
  };

  const generatePDFReport = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll open the HTML report
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lange Group Greenhouse - Technical Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 40px;
              color: #333;
            }
            .header { 
              background: #1e3a8a; 
              color: white; 
              padding: 30px;
              margin: -40px -40px 30px -40px;
            }
            h1 { margin: 0 0 10px 0; }
            .subtitle { opacity: 0.9; }
            .section { 
              margin: 30px 0; 
              page-break-inside: avoid;
            }
            .section h2 { 
              color: #1e3a8a; 
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #ddd;
            }
            th { 
              background: #f5f5f5; 
              font-weight: 600;
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px;
              margin: 20px 0;
            }
            .card { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px;
            }
            .summary-box {
              background: #e3f2fd;
              border: 2px solid #3b82f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lange Group Commercial Greenhouse Facility</h1>
            <p class="subtitle">Technical Design Report - ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary-box">
            <h2>Executive Summary</h2>
            <p>This report details the design specifications for a state-of-the-art commercial greenhouse facility 
            consisting of 5 gutter-connected Venlo greenhouses totaling 26,847.5 square feet.</p>
          </div>
          
          <div class="section">
            <h2>Facility Overview</h2>
            <table>
              <tr><th>Total Greenhouses</th><td>5 Venlo Units</td></tr>
              <tr><th>Total Area</th><td>26,847.5 sq ft</td></tr>
              <tr><th>Individual House Size</th><td>31.5' × 170.6' (9.6m × 52m)</td></tr>
              <tr><th>Gutter Height</th><td>18 feet</td></tr>
              <tr><th>Construction</th><td>Aluminum frame with tempered glass</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>HVAC Systems</h2>
            <div class="grid">
              <div class="card">
                <h3>Heating</h3>
                <p>• 2 × RBI Futera III Boilers<br>
                • 15,674 ft of fin tube<br>
                • 16 heating zones</p>
              </div>
              <div class="card">
                <h3>Cooling</h3>
                <p>• AWS 290 Chiller<br>
                • 67 fan coil units<br>
                • 5 cooling zones</p>
              </div>
              <div class="card">
                <h3>Air Movement</h3>
                <p>• 30 Dramm HAF fans<br>
                • 330W each<br>
                • Variable speed</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Irrigation & Fertigation</h2>
            <table>
              <tr><th>Water Storage</th><td>7,000 gal fresh + 4 batch tanks</td></tr>
              <tr><th>Treatment</th><td>Priva Neutralizer (40 L/hr acid dosing)</td></tr>
              <tr><th>Injection</th><td>Priva NutriJet 50 GPM, 3 channels</td></tr>
              <tr><th>Distribution</th><td>Multi-zone with EC/pH monitoring</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Supplemental Lighting</h2>
            <table>
              <tr><th>Total Fixtures</th><td>987 × 1000W HPS</td></tr>
              <tr><th>Zone 1 (Veg)</th><td>147 fixtures</td></tr>
              <tr><th>Zone 2 (Flower)</th><td>420 fixtures</td></tr>
              <tr><th>Zone 3 (Flower)</th><td>420 fixtures</td></tr>
              <tr><th>Mounting Height</th><td>14.5 feet AFF</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Environmental Controls</h2>
            <p><strong>Automation:</strong> Priva integrated control system<br>
            <strong>Screening:</strong> HARMONY 4515 shade (45%) + OBSCURA 10070 blackout (100%)<br>
            <strong>Ventilation:</strong> 4-zone roof vents with Econet 4045 insect screening</p>
          </div>
          
          <div class="section">
            <h2>Investment Summary</h2>
            <table>
              <tr><th>Total Project Area</th><td>26,847.5 sq ft</td></tr>
              <tr><th>Estimated Investment</th><td>$3,097,186</td></tr>
              <tr><th>Cost per Square Foot</th><td>$115.36</td></tr>
            </table>
          </div>
          
          <div style="margin-top: 50px; text-align: center; color: #666;">
            <p>Generated by Vibelux Professional Design System<br>
            Advanced Greenhouse & Cultivation Facility Design Software</p>
          </div>
        </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Lange Greenhouse Design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/design/advanced">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Design
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">Lange Group Greenhouse Facility</h1>
                  <p className="text-sm text-gray-400">5 Venlo Greenhouses • 26,847 sq ft</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowReport(!showReport)}
                variant={showReport ? "default" : "outline"}
              >
                {showReport ? "Show Designer" : "Show Report"}
              </Button>
              <Button onClick={generatePDFReport} variant="default">
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!showReport ? (
          <div className="bg-gray-800 rounded-xl p-6">
            <ComprehensiveFacilityDesigner
              initialConfig={{
                type: 'greenhouse',
                dimensions: {
                  length: langeGreenhouseConfig.structures.dimensions.length * langeGreenhouseConfig.structures.count,
                  width: langeGreenhouseConfig.structures.dimensions.width,
                  height: langeGreenhouseConfig.structures.dimensions.gutterHeight
                },
                structure: {
                  frame: langeGreenhouseConfig.structures.construction.frame as any,
                  glazing: langeGreenhouseConfig.structures.construction.glazing as any,
                  roofType: langeGreenhouseConfig.structures.type as any
                },
                systems: {
                  irrigation: true,
                  hvac: true,
                  automation: true,
                  lighting: true,
                  co2: true
                }
              }}
              onConfigChange={handleConfigChange}
            />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6">
            {facilityData ? (
              <ComprehensiveFacilityReportBuilder
                facilityData={facilityData}
                projectInfo={{
                  name: "Lange Group Commercial Greenhouse Facility",
                  client: "Lange Group",
                  location: "Brochton, Illinois 61617",
                  date: new Date().toISOString(),
                  proposalNumber: "VLX-16375-01",
                  designer: "Vibelux Design System"
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Configure the facility to generate a report</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Feature Highlights */}
      <div className="bg-gray-800 mt-8 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Lange Facility Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">Venlo Structure</h3>
              <p className="text-gray-300 text-sm">5 connected houses with aluminum frame and 50% haze tempered glass</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">Advanced HVAC</h3>
              <p className="text-gray-300 text-sm">Dual boilers, chiller system, 67 fan coils, 16 heating zones</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold mb-2">Priva Controls</h3>
              <p className="text-gray-300 text-sm">Full automation with climate, irrigation, and screen control</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-orange-400 font-semibold mb-2">987 HPS Lights</h3>
              <p className="text-gray-300 text-sm">3-zone supplemental lighting with 1000W fixtures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}