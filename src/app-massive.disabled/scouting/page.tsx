'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  AlertCircle, 
  Upload, 
  CheckCircle,
  Bug,
  Droplets,
  Leaf,
  Wind,
  Save,
  Send,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ScoutingReport {
  id: string;
  location: { lat: number; lng: number; zone: string };
  type: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  photos: string[];
  notes: string;
  timestamp: Date;
  employeeId: string;
}

export default function ScoutingPage() {
  const [currentReport, setCurrentReport] = useState<Partial<ScoutingReport>>({
    type: 'pest',
    severity: 'medium',
    photos: [],
    notes: ''
  });
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  React.useEffect(() => {
    getLocation();
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setCapturedPhotos([...capturedPhotos, ...newPhotos]);
      setCurrentReport({ ...currentReport, photos: [...capturedPhotos, ...newPhotos] });
    }
  };

  const removePhoto = (index: number) => {
    const updated = capturedPhotos.filter((_, i) => i !== index);
    setCapturedPhotos(updated);
    setCurrentReport({ ...currentReport, photos: updated });
  };

  const submitReport = async () => {
    setIsCapturing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsCapturing(false);
    setShowSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setCapturedPhotos([]);
      setCurrentReport({
        type: 'pest',
        severity: 'medium',
        photos: [],
        notes: ''
      });
    }, 3000);
  };

  const issueTypes = [
    { id: 'pest', label: 'Pest', icon: Bug, color: 'text-red-500' },
    { id: 'disease', label: 'Disease', icon: AlertCircle, color: 'text-orange-500' },
    { id: 'nutrient', label: 'Nutrient', icon: Leaf, color: 'text-yellow-500' },
    { id: 'environmental', label: 'Environment', icon: Wind, color: 'text-blue-500' },
    { id: 'other', label: 'Other', icon: Droplets, color: 'text-gray-500' }
  ];

  const severityLevels = [
    { id: 'low', label: 'Low', color: 'bg-green-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-orange-500' },
    { id: 'critical', label: 'Critical', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-white">Field Scouting</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <MapPin className="w-4 h-4" />
            {location ? (
              <span>Zone: Greenhouse A - Row 12</span>
            ) : (
              <span>Getting location...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Photo Capture */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Capture Photos</h2>
          <div className="grid grid-cols-3 gap-3">
            {capturedPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden"
              >
                <Image
                  src={photo}
                  alt={`Captured ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            
            {capturedPhotos.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-400">Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            Take clear photos of the issue from multiple angles
          </p>
        </div>

        {/* Issue Type */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Issue Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {issueTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setCurrentReport({ ...currentReport, type: type.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentReport.type === type.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${type.color} mx-auto mb-2`} />
                  <span className="text-sm text-white">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Severity Level</h2>
          <div className="flex gap-2">
            {severityLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setCurrentReport({ ...currentReport, severity: level.id as any })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  currentReport.severity === level.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className={`w-3 h-3 ${level.color} rounded-full mx-auto mb-2`} />
                <span className="text-sm text-white">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Additional Notes</h2>
          <textarea
            value={currentReport.notes}
            onChange={(e) => setCurrentReport({ ...currentReport, notes: e.target.value })}
            placeholder="Describe what you're seeing..."
            className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 px-4 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={submitReport}
            disabled={capturedPhotos.length === 0 || isCapturing}
            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-5 h-5" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Report Submitted!</h3>
              <p className="text-gray-400">Your scouting report has been sent to the team.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4 gap-1">
          <button className="py-3 text-purple-500 text-center">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Scout</span>
          </button>
          <button className="py-3 text-gray-400 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <button className="py-3 text-gray-400 text-center">
            <MapPin className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Map</span>
          </button>
          <button className="py-3 text-gray-400 text-center">
            <Leaf className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">History</span>
          </button>
        </div>
      </div>
    </div>
  );
}