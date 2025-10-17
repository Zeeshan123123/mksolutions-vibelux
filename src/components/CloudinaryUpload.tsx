'use client';

import { useEffect, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { logger } from '@/lib/client-logger';

interface CloudinaryUploadProps {
  onUpload: (result: any) => void;
  uploadPreset: string;
  buttonText?: string;
  buttonIcon?: 'camera' | 'upload';
  buttonClass?: string;
  sources?: string[];
  transformations?: any[];
  maxFiles?: number;
  multiple?: boolean;
  folder?: string;
  tags?: string[];
  loading?: boolean;
  disabled?: boolean;
}

export function CloudinaryUpload({
  onUpload,
  uploadPreset,
  buttonText = 'Upload Image',
  buttonIcon = 'upload',
  buttonClass = 'px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2',
  sources = ['local', 'camera'],
  transformations = [],
  maxFiles = 1,
  multiple = false,
  folder,
  tags = [],
  loading = false,
  disabled = false
}: CloudinaryUploadProps) {
  const cloudinaryRef = useRef<any>();
  const widgetRef = useRef<any>();

  useEffect(() => {
    // Load Cloudinary widget script
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => initializeWidget();
      document.body.appendChild(script);
    } else {
      initializeWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  const initializeWidget = () => {
    if (!window.cloudinary) return;

    cloudinaryRef.current = window.cloudinary;
    
    const widgetConfig = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset,
      sources,
      multiple,
      maxFiles,
      folder,
      tags,
      clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      maxFileSize: 10000000, // 10MB
      maxImageFileSize: 10000000,
      maxVideoFileSize: 50000000, // 50MB for videos
      cropping: true,
      croppingAspectRatio: 1,
      showAdvancedOptions: false,
      showUploadMoreButton: multiple,
      transformation: transformations,
      styles: {
        palette: {
          window: '#1F2937',
          sourceBg: '#374151',
          windowBorder: '#6B7280',
          tabIcon: '#9333EA',
          inactiveTabIcon: '#6B7280',
          menuIcons: '#9333EA',
          link: '#9333EA',
          action: '#9333EA',
          inProgress: '#9333EA',
          complete: '#10B981',
          error: '#EF4444',
          textDark: '#FFFFFF',
          textLight: '#E5E7EB'
        }
      }
    };

    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      widgetConfig,
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          onUpload(result.info);
        }
        if (error) {
          logger.error('system', 'Cloudinary upload error:', error );
        }
      }
    );
  };

  const openWidget = () => {
    if (widgetRef.current && !disabled && !loading) {
      widgetRef.current.open();
    }
  };

  const Icon = buttonIcon === 'camera' ? Camera : Upload;

  return (
    <button
      onClick={openWidget}
      disabled={disabled || loading}
      className={`${buttonClass} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {buttonText}
    </button>
  );
}

// Specialized components for different use cases
export function PlantHealthUpload({ onUpload, loading }: { onUpload: (result: any) => void; loading?: boolean }) {
  return (
    <CloudinaryUpload
      onUpload={onUpload}
      uploadPreset="vibelux_plant_health"
      buttonText="📸 Analyze Plant Health"
      buttonIcon="camera"
      sources={['camera', 'local']}
      folder="plant_health"
      tags={['plant', 'health', 'analysis']}
      transformations={[
        { width: 1000, height: 1000, crop: 'limit' },
        { effect: 'auto_brightness' },
        { effect: 'auto_contrast' }
      ]}
      loading={loading}
    />
  );
}

export function EquipmentUpload({ onUpload, loading }: { onUpload: (result: any) => void; loading?: boolean }) {
  return (
    <CloudinaryUpload
      onUpload={onUpload}
      uploadPreset="vibelux_equipment"
      buttonText="📷 Upload Equipment Photo"
      buttonIcon="camera"
      sources={['camera', 'local']}
      folder="equipment"
      tags={['equipment', 'marketplace']}
      transformations={[
        { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
        { effect: 'auto_brightness' },
        { effect: 'auto_contrast' }
      ]}
      loading={loading}
    />
  );
}

export function DesignUpload({ onUpload, multiple = false, loading }: { onUpload: (result: any) => void; multiple?: boolean; loading?: boolean }) {
  return (
    <CloudinaryUpload
      onUpload={onUpload}
      uploadPreset="vibelux_design_cad"
      buttonText="📐 Upload Design Files"
      buttonIcon="upload"
      sources={['local']}
      folder="designs"
      tags={['design', 'cad', 'lighting']}
      multiple={multiple}
      maxFiles={multiple ? 10 : 1}
      transformations={[
        { width: 1920, height: 1080, crop: 'fit' },
        { quality: 'auto:best' }
      ]}
      loading={loading}
    />
  );
}

// Declare global cloudinary type
declare global {
  interface Window {
    cloudinary: any;
  }
}