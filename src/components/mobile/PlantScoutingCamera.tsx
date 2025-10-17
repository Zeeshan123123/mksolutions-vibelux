'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, MapPin, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import { logger } from '@/lib/client-logger';
import { MobileScoutingVisionService, MobileScoutingReport, PhotoAnalysis } from '@/lib/mobile-scouting/patent-safe-mobile-vision';

interface PlantScoutingCameraProps {
  facilityId: string;
  userId: string;
  userName: string;
  onReportSubmitted?: (report: MobileScoutingReport) => void;
}

export function PlantScoutingCamera({ 
  facilityId, 
  userId, 
  userName, 
  onReportSubmitted 
}: PlantScoutingCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [photoAnalyses, setPhotoAnalyses] = useState<PhotoAnalysis[]>([]);
  const [location, setLocation] = useState({
    zone: '',
    row: '',
    section: '',
    gps: null as { latitude: number; longitude: number } | null
  });
  const [issueDetails, setIssueDetails] = useState({
    type: 'pest' as MobileScoutingReport['issueType'],
    severity: 'medium' as MobileScoutingReport['severity'],
    description: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const visionService = new MobileScoutingVisionService({
    googleVisionApiKey: process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY || 'test-key'
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            gps: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => logger.info('system', 'Location access denied:', { data: error  })
      );
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      logger.error('system', 'Camera access denied:', error );
      alert('Camera access is required for plant scouting. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scouting-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setCapturedPhotos(prev => [...prev, file]);
        analyzePhoto(file);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      setCapturedPhotos(prev => [...prev, file]);
      analyzePhoto(file);
    });
  };

  const analyzePhoto = async (photo: File) => {
    setIsAnalyzing(true);
    try {
      const analysis = await visionService.analyzeScoutingPhoto(
        photo,
        {
          facility: facilityId,
          zone: location.zone,
          row: location.row ? parseInt(location.row) : undefined,
          section: location.section,
          gpsCoordinates: location.gps || undefined
        },
        issueDetails.description
      );
      
      setPhotoAnalyses(prev => [...prev, analysis]);
    } catch (error) {
      logger.error('system', 'Photo analysis failed:', error );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoAnalyses(prev => prev.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    if (capturedPhotos.length === 0) {
      alert('Please capture at least one photo');
      return;
    }

    if (!location.zone) {
      alert('Please specify the zone location');
      return;
    }

    setIsSubmitting(true);
    try {
      const report: MobileScoutingReport = {
        id: `report-${Date.now()}`,
        timestamp: new Date(),
        employee: {
          id: userId,
          name: userName,
          role: 'grower' // TODO: Get from user profile
        },
        location: {
          facility: facilityId,
          zone: location.zone,
          row: location.row ? parseInt(location.row) : undefined,
          section: location.section,
          gpsCoordinates: location.gps || undefined
        },
        issueType: issueDetails.type,
        photos: photoAnalyses,
        severity: issueDetails.severity,
        description: issueDetails.description,
        recommendedActions: [], // Will be populated by backend
        status: 'reported'
      };

      // Submit to API
      const formData = new FormData();
      formData.append('data', JSON.stringify(report));
      
      capturedPhotos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      const response = await fetch('/api/scouting/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSubmitStatus('success');
        onReportSubmitted?.(report);
        
        // Reset form
        setCapturedPhotos([]);
        setPhotoAnalyses([]);
        setLocation({ zone: '', row: '', section: '', gps: location.gps });
        setIssueDetails({ type: 'pest', severity: 'medium', description: '' });
        
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      logger.error('system', 'Report submission failed:', error );
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Plant Scouting
        </h2>
        <p className="text-sm opacity-90">Spot check and report issues</p>
      </div>

      {/* Camera View */}
      {isCapturing && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-green-600 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
            </button>
            <button
              onClick={stopCamera}
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Photo Upload Options */}
      {!isCapturing && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startCamera}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Take Photo</span>
            </button>
            
            <label className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Upload Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Captured Photos */}
      {capturedPhotos.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="font-medium mb-3">Captured Photos ({capturedPhotos.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Capture ${index + 1}`}
                  className="w-full aspect-square object-cover rounded"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Analysis Status */}
                {photoAnalyses[index] && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Analyzed
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {isAnalyzing && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
              Analyzing photos...
            </div>
          )}
        </div>
      )}

      {/* Location Input */}
      <div className="p-4 border-t space-y-3">
        <h3 className="font-medium flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Location
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Zone"
            value={location.zone}
            onChange={(e) => setLocation(prev => ({ ...prev, zone: e.target.value }))}
            className="px-3 py-2 border rounded text-sm"
            required
          />
          <input
            type="text"
            placeholder="Row"
            value={location.row}
            onChange={(e) => setLocation(prev => ({ ...prev, row: e.target.value }))}
            className="px-3 py-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="Section"
            value={location.section}
            onChange={(e) => setLocation(prev => ({ ...prev, section: e.target.value }))}
            className="px-3 py-2 border rounded text-sm"
          />
        </div>
        
        {location.gps && (
          <div className="text-xs text-gray-500">
            GPS: {location.gps.latitude.toFixed(6)}, {location.gps.longitude.toFixed(6)}
          </div>
        )}
      </div>

      {/* Issue Details */}
      <div className="p-4 border-t space-y-3">
        <h3 className="font-medium flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Issue Details
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <select
            value={issueDetails.type}
            onChange={(e) => setIssueDetails(prev => ({ 
              ...prev, 
              type: e.target.value as MobileScoutingReport['issueType'] 
            }))}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="pest">Pest</option>
            <option value="disease">Disease</option>
            <option value="nutrient">Nutrient</option>
            <option value="environmental">Environmental</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={issueDetails.severity}
            onChange={(e) => setIssueDetails(prev => ({ 
              ...prev, 
              severity: e.target.value as MobileScoutingReport['severity'] 
            }))}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <textarea
          placeholder="Describe what you observed..."
          value={issueDetails.description}
          onChange={(e) => setIssueDetails(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Analysis Results */}
      {photoAnalyses.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="font-medium mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            AI Analysis
          </h3>
          
          {photoAnalyses.map((analysis, index) => (
            <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-2">Photo {index + 1}</div>
              
              {analysis.analysis.googleVision.labels.slice(0, 3).map((label, i) => (
                <div key={i} className="text-xs text-gray-600">
                  {label.description}: {(label.score * 100).toFixed(0)}%
                </div>
              ))}
              
              {analysis.analysis.customAnalysis?.pestDetection?.map((pest, i) => (
                <div key={i} className="text-xs text-red-600 mt-1">
                  ⚠️ Possible {pest.commonName} ({(pest.confidence * 100).toFixed(0)}% confidence)
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="p-4 border-t">
        <button
          onClick={submitReport}
          disabled={capturedPhotos.length === 0 || !location.zone || isSubmitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </button>
        
        {submitStatus === 'success' && (
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Report submitted successfully!
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Submission failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}