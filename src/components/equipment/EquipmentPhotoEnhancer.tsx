'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { logger } from '@/lib/client-logger';
import { 
  Upload, Wand2, Package, Sparkles, 
  RotateCw, FileText, Store, Loader2,
  Download, X, Check
} from 'lucide-react';

interface EnhancedPhoto {
  main?: string;
  thumbnail?: string;
  enhanced?: string;
  showcase?: string;
  comparison?: string;
  social?: string;
  specifications?: any;
}

export function EquipmentPhotoEnhancer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedPhotos, setEnhancedPhotos] = useState<EnhancedPhoto>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleUpload = (result: any) => {
    setUploadedImage(result.info.secure_url);
    setEnhancedPhotos({});
  };

  const enhancePhoto = async (action: string) => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    setSelectedAction(action);
    
    try {
      const response = await fetch('/api/equipment/enhance-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          equipmentName: 'VibeLux Equipment',
          action
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnhancedPhotos(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      logger.error('system', 'Enhancement error:', error );
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const actions = [
    {
      id: 'remove-background',
      name: 'Remove Background',
      icon: Wand2,
      description: 'AI-powered background removal for clean product shots',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'enhance-lighting',
      name: 'Fix Grow Light Color',
      icon: Sparkles,
      description: 'Correct purple/pink lighting to show true colors',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'marketplace-ready',
      name: 'Marketplace Ready',
      icon: Store,
      description: 'Complete optimization for equipment listings',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'extract-specs',
      name: 'Extract Specifications',
      icon: FileText,
      description: 'AI reads labels and extracts equipment specs',
      color: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Section */}
      {!uploadedImage ? (
        <CldUploadWidget
          uploadPreset="vibelux_equipment"
          onSuccess={handleUpload}
          options={{
            sources: ['local', 'url', 'camera'],
            maxFiles: 1,
            resourceType: 'image'
          }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              className="w-full p-12 border-2 border-dashed border-gray-700 rounded-xl hover:border-purple-500 transition-all bg-gray-900/50 group"
            >
              <Upload className="w-16 h-16 text-gray-500 group-hover:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 group-hover:text-white mb-2">
                Upload Equipment Photo
              </h3>
              <p className="text-gray-500">
                Drag & drop or click to upload • AI enhancement included
              </p>
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Original Photo</h3>
            <button
              onClick={() => {
                setUploadedImage(null);
                setEnhancedPhotos({});
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={uploadedImage}
            alt="Uploaded equipment"
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>
      )}

      {/* Enhancement Actions */}
      {uploadedImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            const isActive = selectedAction === action.id;
            const isDone = enhancedPhotos[action.id === 'remove-background' ? 'enhanced' : action.id];
            
            return (
              <button
                key={action.id}
                onClick={() => enhancePhoto(action.id)}
                disabled={isProcessing}
                className={`relative p-6 rounded-xl border transition-all ${
                  isDone 
                    ? 'bg-green-900/20 border-green-700' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-8 h-8 ${isDone ? 'text-green-400' : 'text-gray-400'}`} />
                    {isActive && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
                    {isDone && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  
                  <h3 className="text-white font-semibold text-left mb-1">
                    {action.name}
                  </h3>
                  <p className="text-gray-400 text-sm text-left">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Display */}
      {Object.keys(enhancedPhotos).length > 0 && (
        <div className="space-y-4">
          {/* Enhanced Image */}
          {enhancedPhotos.enhanced && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Background Removed</h3>
                <a
                  href={enhancedPhotos.enhanced}
                  download
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
              <img
                src={enhancedPhotos.enhanced}
                alt="Enhanced equipment"
                className="w-full max-w-md mx-auto rounded-lg bg-white"
              />
            </div>
          )}

          {/* Showcase Version */}
          {enhancedPhotos.showcase && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Product Showcase</h3>
              <img
                src={enhancedPhotos.showcase}
                alt="Showcase version"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Comparison Slider */}
          {enhancedPhotos.comparison && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Before/After Comparison</h3>
              <img
                src={enhancedPhotos.comparison}
                alt="Comparison"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Marketplace Versions */}
          {enhancedPhotos.main && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Marketplace Ready Versions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Main Listing</p>
                  <img src={enhancedPhotos.main} alt="Main" className="w-full rounded-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Thumbnail</p>
                  <img src={enhancedPhotos.thumbnail} alt="Thumbnail" className="w-full rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {/* Extracted Specifications */}
          {enhancedPhotos.specifications && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Extracted Specifications</h3>
              <div className="space-y-2">
                {Object.entries(enhancedPhotos.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 capitalize">{key}:</span>
                    <span className="text-white font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}