'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Box, Upload } from 'lucide-react'
import { CADFileUpload } from '@/components/CADFileUpload'
import AutodeskViewer from '@/components/AutodeskViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CADFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  progress: number
  urn?: string
  error?: string
  uploadedAt: Date
}

export default function CADViewerPage() {
  const [selectedFile, setSelectedFile] = useState<CADFile | null>(null)
  const [viewerKey, setViewerKey] = useState(0) // Force viewer re-render

  const handleFileReady = (file: CADFile) => {
    setSelectedFile(file)
    setViewerKey(prev => prev + 1) // Force viewer to re-initialize
  }

  const handleFileSelected = (file: CADFile) => {
    // Could show upload progress here
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  CAD Viewer
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/design"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Design Studio
              </Link>
              <Link
                href="/plant-health"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Plant Health
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            3D CAD File Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and view CAD files in your browser. Supports AutoCAD, STEP, STL, Revit, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div>
            <CADFileUpload
              onFileReady={handleFileReady}
              onFileSelected={handleFileSelected}
              maxFileSize={100}
              allowedTypes={['.dwg', '.dxf', '.step', '.stp', '.iges', '.igs', '.obj', '.stl', '.rvt', '.ifc']}
            />
          </div>

          {/* 3D Viewer Section */}
          <div>
            {selectedFile ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Box className="w-5 h-5" />
                      Viewing: {selectedFile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AutodeskViewer
                      key={viewerKey}
                      urn={selectedFile.urn}
                      showToolbar={true}
                      enableMeasurements={true}
                      enableSectioning={true}
                      className="h-96"
                      onModelLoad={(viewer) => {
                        console.log('Model loaded in viewer:', viewer)
                      }}
                      onSelectionChange={(selection) => {
                        console.log('Selection changed:', selection)
                      }}
                    />
                  </CardContent>
                </Card>

                {/* File Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">File Size:</span>
                        <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span>
                        <p>{selectedFile.uploadedAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <p>{selectedFile.name.split('.').pop()?.toLowerCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="capitalize">{selectedFile.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No File Selected</p>
                    <p className="text-sm">Upload a CAD file to view it in 3D</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Formats
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Support for AutoCAD (DWG/DXF), STEP, IGES, STL, OBJ, Revit, IFC, and more CAD formats.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cloud Processing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Files are processed in the cloud and optimized for fast 3D viewing in any browser.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Box className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Tools
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Measure distances, take screenshots, change view modes, and explore your models in detail.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Alert className="mt-8">
          <Box className="h-4 w-4" />
          <AlertDescription>
            <strong>Getting Started:</strong> To use the 3D viewer, you'll need Autodesk Forge API credentials. 
            Add your <code>FORGE_CLIENT_ID</code> and <code>FORGE_CLIENT_SECRET</code> to your environment variables. 
            Get free credentials at <a href="https://forge.autodesk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">forge.autodesk.com</a>.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  )
}