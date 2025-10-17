'use client';

import { useState, useCallback } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { logger } from '@/lib/client-logger';
import { CloudinaryAdvanced } from '@/lib/cloudinary-advanced';
import { 
  Upload, Wand2, Layers, Sparkles, 
  Image as ImageIcon, Palette, Zap,
  Download, Share2, Eye
} from 'lucide-react';

interface AdvancedImageUploadProps {
  onUpload: (result: any) => void;
  uploadPreset: string;
  folder?: string;
  maxFiles?: number;
}

export function AdvancedImageUpload({ 
  onUpload, 
  uploadPreset, 
  folder = 'general',
  maxFiles = 1 
}: AdvancedImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [transformations, setTransformations] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSuccess = useCallback((result: any) => {
    const publicId = result.info.public_id;
    setUploadedImage(publicId);
    
    // Apply AI enhancements automatically
    if (folder === 'plant_health') {
      applyTransformation('ai-enhance');
    } else if (folder === 'equipment') {
      applyTransformation('remove-bg');
    }
    
    onUpload(result);
  }, [folder, onUpload]);

  const applyTransformation = (type: string) => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    let transformedUrl = '';
    
    switch (type) {
      case 'remove-bg':
        transformedUrl = CloudinaryAdvanced.ai.removeBackground(uploadedImage).toURL();
        break;
      case 'ai-enhance':
        transformedUrl = CloudinaryAdvanced.ai.enhancePlantImage(uploadedImage).toURL();
        break;
      case 'product-showcase':
        transformedUrl = CloudinaryAdvanced.ai.productShowcase(uploadedImage, 'VibeLux Pro').toURL();
        break;
      case 'color-correct':
        transformedUrl = CloudinaryAdvanced.ai.correctGrowLightColor(uploadedImage).toURL();
        break;
      case 'responsive':
        transformedUrl = CloudinaryAdvanced.performance.responsiveImage(uploadedImage).toURL();
        break;
      default:
        break;
    }
    
    setTransformations(prev => [...prev, transformedUrl]);
    setIsProcessing(false);
  };

  const generateSocialMediaVersions = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    const variants = CloudinaryAdvanced.batch.generateSocialVariants(uploadedImage);
    
    // In real implementation, these would be saved/displayed
    logger.info('system', 'Social media variants:', { data: variants });
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Widget */}
      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          folder,
          maxFiles,
          sources: ['local', 'url', 'camera', 'dropbox', 'google_drive'],
          multiple: maxFiles > 1,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'],
          maxFileSize: 10485760, // 10MB
          showPoweredBy: false,
          styles: {
            palette: {
              window: "#1F2937",
              windowBorder: "#374151",
              tabIcon: "#9333EA",
              menuIcons: "#9333EA",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#9333EA",
              action: "#9333EA",
              inactiveTabIcon: "#6B7280",
              error: "#EF4444",
              inProgress: "#9333EA",
              complete: "#10B981",
              sourceBg: "#111827"
            }
          },
          // AI-powered features during upload
          upload_preset: uploadPreset,
          detection: "adv_face", // Advanced face/object detection
          ocr: "adv_ocr", // Extract text from images
          categorization: "google_tagging",
          auto_tagging: 0.7,
          eager: [
            { width: 400, height: 400, crop: "fill", gravity: "auto" },
            { width: 1200, quality: "auto:best", fetch_format: "auto" }
          ],
          eager_async: true,
          eager_notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
        }}
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <button
            onClick={() => open()}
            className="w-full p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-purple-500 transition-all bg-gray-900/50 group"
          >
            <Upload className="w-12 h-12 text-gray-500 group-hover:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 group-hover:text-gray-300">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-2">
              AI-powered enhancement included
            </p>
          </button>
        )}
      </CldUploadWidget>

      {/* Image Preview & Transformations */}
      {uploadedImage && (
        <div className="space-y-4">
          {/* Original Image */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Original Upload
            </h3>
            <div className="relative group">
              <CldImage
                src={uploadedImage}
                width={400}
                height={300}
                alt="Uploaded image"
                className="rounded-lg w-full"
                loading="lazy"
                placeholder="blur"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* AI Transformation Options */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Enhancements
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => applyTransformation('remove-bg')}
                disabled={isProcessing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-sm text-gray-300 flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Remove Background
              </button>
              
              <button
                onClick={() => applyTransformation('ai-enhance')}
                disabled={isProcessing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-sm text-gray-300 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                AI Enhance
              </button>
              
              <button
                onClick={() => applyTransformation('color-correct')}
                disabled={isProcessing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-sm text-gray-300 flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Color Correct
              </button>
              
              <button
                onClick={() => applyTransformation('product-showcase')}
                disabled={isProcessing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-sm text-gray-300 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Product Mode
              </button>
            </div>

            {/* Social Media Variants */}
            <button
              onClick={generateSocialMediaVersions}
              disabled={isProcessing}
              className="w-full mt-3 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-white flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Generate Social Media Versions
            </button>
          </div>

          {/* Transformed Images */}
          {transformations.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="text-white font-semibold mb-3">Transformed Images</h3>
              <div className="grid grid-cols-2 gap-3">
                {transformations.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Transformation ${index + 1}`}
                      className="rounded-lg w-full"
                    />
                    <button
                      className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
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