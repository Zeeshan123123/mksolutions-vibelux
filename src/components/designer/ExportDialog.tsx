import React, { useState } from 'react';
import { FileDown, FileText, FileSpreadsheet, Image, Package, Compass } from 'lucide-react';

interface ExportDialogProps {
  onExport: (format: 'json' | 'pdf' | 'dwg' | 'excel' | 'html' | 'cad') => void;
  onClose: () => void;
}

const exportFormats = [
  {
    format: 'cad' as const,
    name: 'CAD Engineering Report',
    description: 'Professional CAD-style technical drawings with electrical schematics',
    icon: Compass,
    color: 'text-cyan-400'
  },
  {
    format: 'pdf' as const,
    name: 'PDF Report',
    description: 'Professional report with layouts and calculations',
    icon: FileText,
    color: 'text-red-400'
  },
  {
    format: 'html' as const,
    name: 'HTML Report',
    description: 'Interactive web report with full styling',
    icon: FileText,
    color: 'text-orange-400'
  },
  {
    format: 'excel' as const,
    name: 'Excel Spreadsheet',
    description: 'Detailed data export for analysis',
    icon: FileSpreadsheet,
    color: 'text-green-400'
  },
  {
    format: 'dwg' as const,
    name: 'AutoCAD DWG',
    description: 'CAD file for architectural integration',
    icon: Package,
    color: 'text-blue-400'
  },
  {
    format: 'json' as const,
    name: 'JSON Data',
    description: 'Raw data for developers and integrations',
    icon: FileDown,
    color: 'text-purple-400'
  }
];

export default function ExportDialog({ onExport, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'pdf' | 'dwg' | 'excel' | 'html' | 'cad'>('cad');
  const [includeOptions, setIncludeOptions] = useState({
    heatmap: true,
    spectrum: true,
    calculations: true,
    fixtures: true,
    electrical: true
  });

  const handleExport = () => {
    onExport(selectedFormat);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Export Format</h3>
        <div className="grid grid-cols-2 gap-3">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.format}
                onClick={() => setSelectedFormat(format.format)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === format.format
                    ? 'border-purple-500 bg-purple-900 bg-opacity-30'
                    : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${format.color} mb-2`} />
                <h4 className="font-semibold">{format.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{format.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Include in Export</h3>
        <div className="space-y-2">
          {Object.entries(includeOptions).map(([key, value]) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setIncludeOptions({ ...includeOptions, [key]: e.target.checked })}
                className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold"
        >
          Export {exportFormats.find(f => f.format === selectedFormat)?.name}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}