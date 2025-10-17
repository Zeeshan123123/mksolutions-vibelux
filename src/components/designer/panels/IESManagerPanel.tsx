'use client';

import React, { useState, useRef } from 'react';
import { X, FileText, Upload, Download, Search, Eye, Trash2, Edit, FolderOpen, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { parseIESFile } from '@/lib/ies-parser';
import { useDesigner } from '@/components/designer/context/DesignerContext';
import type { FixtureModel } from '@/components/FixtureLibrary';

interface IESManagerPanelProps {
  onClose: () => void;
}

interface IESFile {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  wattage: number;
  lumens: number;
  uploadDate: Date;
  fileSize: string;
  verified: boolean;
}

export function IESManagerPanel({ onClose }: IESManagerPanelProps) {
  const { showNotification } = useDesigner();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [iesFiles, setIesFiles] = useState<IESFile[]>([
    {
      id: '1',
      name: 'LED_Grow_Light_600W.ies',
      manufacturer: 'Fluence',
      model: 'SPYDR 2p',
      wattage: 645,
      lumens: 52000,
      uploadDate: new Date('2024-01-10'),
      fileSize: '124 KB',
      verified: true
    },
    {
      id: '2',
      name: 'Gavita_1700e_LED.ies',
      manufacturer: 'Gavita',
      model: 'Pro 1700e LED',
      wattage: 645,
      lumens: 48000,
      uploadDate: new Date('2024-01-08'),
      fileSize: '98 KB',
      verified: true
    },
    {
      id: '3',
      name: 'Custom_Bar_Light.ies',
      manufacturer: 'Custom',
      model: 'Bar-48',
      wattage: 320,
      lumens: 28000,
      uploadDate: new Date('2024-01-05'),
      fileSize: '156 KB',
      verified: false
    }
  ]);

  const filteredFiles = iesFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file extension
        if (!file.name.endsWith('.ies')) {
          showNotification({
            type: 'error',
            message: `${file.name} is not an IES file`,
            duration: 3000
          });
          continue;
        }

        // Read file content
        const content = await file.text();
        
        try {
          // Parse IES file
          const parsedIES = await parseIESFile(content);
          
          // Create new IES file entry
          const newIESFile: IESFile = {
            id: Date.now().toString() + '_' + i,
            name: file.name,
            manufacturer: parsedIES.header.manufacturer || 'Unknown',
            model: parsedIES.header.lumcat || 'Unknown Model',
            wattage: Math.round(parsedIES.metadata.inputWatts || 0),
            lumens: Math.round(parsedIES.metadata.lumensPerLamp * parsedIES.metadata.numberOfLamps),
            uploadDate: new Date(),
            fileSize: `${Math.round(file.size / 1024)} KB`,
            verified: true
          };

          setIesFiles(prev => [...prev, newIESFile]);
          
          // Store parsed IES data in localStorage for use in fixtures
          const iesData = {
            parsedData: parsedIES,
            photometry: parsedIES.photometry
          };
          localStorage.setItem(`ies_${newIESFile.id}`, JSON.stringify(iesData));

          showNotification({
            type: 'success',
            message: `Successfully uploaded ${file.name}`,
            duration: 3000
          });
        } catch (parseError) {
          showNotification({
            type: 'error',
            message: `Failed to parse ${file.name}: Invalid IES format`,
            duration: 5000
          });
        }
        
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to upload files',
        duration: 5000
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = files;
      handleFileUpload({ target: { files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-[480px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          IES File Manager
        </h3>
        <a
          href="/how-it-works/photometry-ies?utm_source=vibelux&utm_medium=howitworks&utm_campaign=photometry_help&utm_content=ies_manager"
          className="text-xs text-blue-400 hover:text-blue-300 underline"
          target="_blank"
          rel="noreferrer"
        >
          How photometry & IES work
        </a>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Search and Upload */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search IES files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload IES File
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
            <FolderOpen className="h-4 w-4" />
            Import Batch
          </button>
        </div>
      </div>

      {/* Upload Area (Hidden by default) */}
      {showUpload && (
        <div 
          className="mb-4 p-4 border-2 border-dashed border-gray-700 rounded-lg text-center transition-colors hover:border-gray-600"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {isUploading ? (
            <>
              <div className="h-8 w-8 mx-auto mb-2">
                <svg className="animate-spin text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 mb-2">Uploading... {Math.round(uploadProgress)}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-2">Drop IES files here or click to browse</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".ies" 
                multiple
                className="hidden" 
                id="ies-upload" 
                onChange={handleFileUpload}
              />
              <label htmlFor="ies-upload" className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                Select Files
              </label>
              <p className="text-xs text-gray-500 mt-2">Supports multiple IES files at once</p>
            </>
          )}
        </div>
      )}

      {/* IES Files List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setSelectedFile(file.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedFile === file.id
                ? 'bg-blue-600/20 border border-blue-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <h4 className="font-medium text-white text-sm">{file.name}</h4>
                  {file.verified && (
                    <span className="px-2 py-0.5 bg-green-600/20 border border-green-600 rounded text-xs text-green-400">
                      Verified
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <span>{file.manufacturer} - {file.model}</span>
                  <span>{file.wattage}W / {file.lumens} lm</span>
                  <span>{file.uploadDate.toLocaleDateString()}</span>
                  <span>{file.fileSize}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Eye className="h-3 w-3 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Edit className="h-3 w-3 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Trash2 className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-4 bg-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Photometric Preview</h4>
          <div className="h-32 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Polar curve visualization</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Beam Angle</div>
              <div className="text-white">120°</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Efficacy</div>
              <div className="text-white">2.7 μmol/J</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">CRI</div>
              <div className="text-white">85</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {selectedFile && (
          <button 
            onClick={() => {
              const selected = iesFiles.find(f => f.id === selectedFile);
              if (selected) {
                showNotification({
                  type: 'info',
                  message: `IES file "${selected.name}" is now available in the Fixture Library`,
                  duration: 4000
                });
                // The IES data is already stored in localStorage and can be used by fixtures
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Use with Fixtures
          </button>
        )}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Export Selected
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            IES files contain photometric (candela) data for light distribution. For horticulture, IES does not encode PAR spectrum; we estimate μmol/s using watts × PPE until you set true PPF/PPE.
          </p>
        </div>
      </div>
    </div>
  );
}