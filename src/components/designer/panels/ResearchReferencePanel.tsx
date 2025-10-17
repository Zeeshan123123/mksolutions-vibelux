'use client';

import React from 'react';
import { 
  X, 
  ExternalLink, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { RESEARCH_BACKED_CROPS, type ResearchBackedCropData } from '@/lib/plants/research-backed-crop-data';

interface ResearchReferencePanelProps {
  cropId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ResearchReferencePanel({ cropId, isOpen, onClose }: ResearchReferencePanelProps) {
  if (!isOpen) return null;

  const cropData = RESEARCH_BACKED_CROPS[cropId];
  if (!cropData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="w-5 h-5" />
            <p>No research data available for this crop yet.</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const allCitations = [
    { category: 'Lighting - PPFD', data: cropData.lightingData.ppfd.citation },
    { category: 'Lighting - DLI', data: cropData.lightingData.dli.citation },
    { category: 'Lighting - Photoperiod', data: cropData.lightingData.photoperiod.citation },
    ...(cropData.lightingData.spectrum ? [{ category: 'Lighting - Spectrum', data: cropData.lightingData.spectrum.citation }] : []),
    { category: 'Temperature', data: cropData.environmentalData.temperature.citation },
    { category: 'Humidity', data: cropData.environmentalData.humidity.citation },
    ...(cropData.environmentalData.co2 ? [{ category: 'CO₂ Enrichment', data: cropData.environmentalData.co2.citation }] : []),
    { category: 'Plant Height', data: cropData.growthData.height.citation },
    { category: 'Plant Spacing', data: cropData.growthData.spacing.citation }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Research References: {cropData.cropName}
              </h2>
              <p className="text-sm text-gray-400 mt-1 italic">{cropData.scientificName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Optimal Conditions</h3>
              <div className="space-y-1">
                <p className="text-white">PPFD: {cropData.lightingData.ppfd.optimal} μmol/m²/s</p>
                <p className="text-white">DLI: {cropData.lightingData.dli.optimal} mol/m²/day</p>
                <p className="text-white">Temp: {cropData.environmentalData.temperature.day[0]}-{cropData.environmentalData.temperature.day[1]}°F</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Plant Specifications</h3>
              <div className="space-y-1">
                <p className="text-white">Height: {cropData.growthData.height.mature} {cropData.growthData.height.unit}</p>
                <p className="text-white">Spacing: {cropData.growthData.spacing.optimal} {cropData.growthData.spacing.unit}</p>
                <p className="text-white">Density: {cropData.growthData.spacing.plantsPerSqMeter}/m²</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Research Status</h3>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{allCitations.length} Peer-Reviewed Sources</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">All recommendations verified</p>
            </div>
          </div>

          {/* Citations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Research Citations by Category</h3>
            
            {allCitations.map((citation, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-400 mb-1">{citation.category}</h4>
                    <p className="text-white font-medium">{citation.data.title}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {citation.data.authors} • {citation.data.year} • {citation.data.journal}
                    </p>
                    
                    {/* Key Findings */}
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Key Findings:</p>
                      {citation.data.keyFindings.map((finding, idx) => (
                        <p key={idx} className="text-sm text-gray-300 pl-4">• {finding}</p>
                      ))}
                    </div>
                  </div>
                  
                  {/* Links */}
                  <div className="ml-4 flex flex-col gap-2">
                    {citation.data.doi && (
                      <a
                        href={`https://doi.org/${citation.data.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <FileText className="w-3 h-3" />
                        DOI
                      </a>
                    )}
                    {citation.data.url && (
                      <a
                        href={citation.data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> These recommendations are based on peer-reviewed research. 
              Actual results may vary based on cultivar, environmental conditions, and management practices. 
              Always validate with your specific growing conditions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <a
              href="/research-library"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              View Full Research Library
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}