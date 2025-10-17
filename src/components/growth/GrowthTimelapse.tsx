'use client';

import { useState, useCallback } from 'react';
import { 
  Video, Upload, Play, Download, Share2, 
  Instagram, Twitter, Music, Settings,
  Loader2, CheckCircle, AlertCircle, Calendar
} from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { logger } from '@/lib/client-logger';
import { createGrowthTimelapse, createHighlightReel } from '@/lib/cloudinary-video-timelapse';

interface TimelapseImage {
  url: string;
  timestamp: Date;
  day: number;
  notes?: string;
}

export function GrowthTimelapse({ plantId, userId }: { plantId: string; userId: string }) {
  const [images, setImages] = useState<TimelapseImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timelapseResult, setTimelapseResult] = useState<any>(null);
  const [settings, setSettings] = useState({
    duration: 30,
    fps: 30,
    watermark: true,
    musicTrack: 'upbeat' as 'upbeat' | 'calm' | 'none',
    annotations: true,
    title: 'My Plant Growth Journey'
  });

  const handleImageUpload = useCallback((result: any) => {
    const uploadedUrl = result.info.secure_url;
    const dayNumber = images.length + 1;
    
    setImages(prev => [...prev, {
      url: uploadedUrl,
      timestamp: new Date(),
      day: dayNumber,
      notes: ''
    }]);
  }, [images.length]);

  const createTimelapse = async () => {
    if (images.length < 5) {
      alert('Please upload at least 5 images to create a timelapse');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createGrowthTimelapse(images, {
        userId,
        plantId,
        ...settings
      });
      
      setTimelapseResult(result);
    } catch (error) {
      logger.error('system', 'Failed to create timelapse:', error );
    } finally {
      setIsProcessing(false);
    }
  };

  const createHighlights = async () => {
    const highlights = images
      .filter((_, index) => index % Math.floor(images.length / 5) === 0)
      .map((img, index) => ({
        imageUrl: img.url,
        caption: `Day ${img.day} - Growth Progress`,
        importance: index === 0 || index === images.length - 1 ? 'high' as const : 'medium' as const
      }));

    setIsProcessing(true);
    try {
      const reelUrl = await createHighlightReel(plantId, highlights);
      setTimelapseResult(prev => ({
        ...prev,
        highlightReel: reelUrl
      }));
    } catch (error) {
      logger.error('system', 'Failed to create highlight reel:', error );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Create Growth Time-lapse
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Upload daily photos of your plant to create a stunning time-lapse video. 
          AI-powered editing creates professional results automatically.
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Upload */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Upload Growth Photos
          </h3>

          <CldUploadWidget
            uploadPreset="vibelux_timelapse"
            options={{
              sources: ['local', 'url', 'camera', 'dropbox'],
              multiple: true,
              maxFiles: 30,
              resourceType: 'image'
            }}
            onSuccess={handleImageUpload}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                className="w-full p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-purple-500 transition-all group"
              >
                <Upload className="w-12 h-12 text-gray-500 group-hover:text-purple-400 mx-auto mb-3" />
                <p className="text-gray-400 group-hover:text-gray-300">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload in chronological order for best results
                </p>
              </button>
            )}
          </CldUploadWidget>

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">
                {images.length} photos uploaded
              </p>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={`Day ${img.day}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-xs text-white">Day {img.day}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Video Settings
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Video Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="My Plant Growth Journey"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Video Duration (seconds)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.duration}
                onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>{settings.duration}s</span>
                <span>60s</span>
              </div>
            </div>

            {/* Music */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Background Music
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['upbeat', 'calm', 'none'] as const).map((track) => (
                  <button
                    key={track}
                    onClick={() => setSettings(prev => ({ ...prev, musicTrack: track }))}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      settings.musicTrack === track
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Music className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs capitalize">{track}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.watermark}
                  onChange={(e) => setSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Add VibeLux watermark</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.annotations}
                  onChange={(e) => setSettings(prev => ({ ...prev, annotations: e.target.checked }))}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Show day counter</span>
              </label>
            </div>

            {/* Create Button */}
            <button
              onClick={createTimelapse}
              disabled={images.length < 5 || isProcessing}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                images.length >= 5 && !isProcessing
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Time-lapse...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Create Time-lapse
                </>
              )}
            </button>

            {images.length < 5 && images.length > 0 && (
              <p className="text-sm text-yellow-400 text-center">
                Upload {5 - images.length} more photos to create a timelapse
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {timelapseResult && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Time-lapse Created Successfully!
            </h3>
            <p className="text-gray-400">
              Your growth journey has been transformed into a stunning video
            </p>
          </div>

          {/* Video Preview */}
          <div className="max-w-2xl mx-auto mb-8">
            <video
              src={timelapseResult.videoUrl}
              controls
              className="w-full rounded-lg"
              poster={timelapseResult.thumbnailUrl}
            />
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {timelapseResult.analytics.totalFrames}
              </div>
              <div className="text-sm text-gray-400">Frames</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {timelapseResult.analytics.duration}s
              </div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {(timelapseResult.analytics.fileSize / 1024 / 1024).toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-400">File Size</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {timelapseResult.analytics.growthRate}
              </div>
              <div className="text-sm text-gray-400">Growth Rate</div>
            </div>
          </div>

          {/* Download & Share Options */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={timelapseResult.videoUrl}
              download
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download HD Video
            </a>
            
            <a
              href={timelapseResult.gifUrl}
              download
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download GIF
            </a>

            <button
              onClick={() => window.open(timelapseResult.socialVersions.instagram, '_blank')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              Share on Instagram
            </button>

            <button
              onClick={() => window.open(timelapseResult.socialVersions.twitter, '_blank')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Twitter className="w-5 h-5" />
              Share on Twitter
            </button>
          </div>

          {/* Create Highlight Reel */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <button
              onClick={createHighlights}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Create 15s Highlight Reel
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Perfect for Instagram Reels and TikTok
            </p>
          </div>
        </div>
      )}
    </div>
  );
}