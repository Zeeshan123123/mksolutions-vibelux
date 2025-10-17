'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  Box,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Download,
  Eye,
  File
} from 'lucide-react'

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

interface CADFileUploadProps {
  onFileReady?: (file: CADFile) => void
  onFileSelected?: (file: CADFile) => void
  maxFileSize?: number // in MB
  allowedTypes?: string[]
}

const DEFAULT_ALLOWED_TYPES = [
  '.dwg', '.dxf', '.step', '.stp', '.iges', '.igs', 
  '.obj', '.stl', '.3ds', '.fbx', '.ifc', '.rvt'
]

const DEFAULT_MAX_SIZE = 100 // 100MB

export function CADFileUpload({
  onFileReady,
  onFileSelected,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: CADFileUploadProps) {
  const [files, setFiles] = useState<CADFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(extension)) {
      return `File type ${extension} not supported. Allowed types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const uploadFileToForge = async (file: File): Promise<string> => {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload to Forge
    const response = await fetch('/api/forge/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    const result = await response.json()
    return result.urn
  }

  const processFiles = async (fileList: FileList) => {
    const newFiles: CADFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const validationError = validateFile(file)

      const cadFile: CADFile = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        status: validationError ? 'error' : 'uploading',
        progress: 0,
        error: validationError || undefined,
        uploadedAt: new Date()
      }

      newFiles.push(cadFile)
      onFileSelected?.(cadFile)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Process valid files
    for (const cadFile of newFiles) {
      if (cadFile.status === 'error') continue

      try {
        setUploading(true)
        
        // Simulate upload progress
        const file = Array.from(fileList).find(f => f.name === cadFile.name)!
        
        // Update progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200))
          setFiles(prev => prev.map(f => 
            f.id === cadFile.id 
              ? { ...f, progress, status: progress === 100 ? 'processing' : 'uploading' }
              : f
          ))
        }

        // Upload to Forge (this would be the actual implementation)
        try {
          // For demo purposes, we'll simulate a successful upload
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const mockUrn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0LWlhbi9yYWNrc3lzdGVtLmlmYw'
          
          setFiles(prev => prev.map(f => 
            f.id === cadFile.id 
              ? { ...f, status: 'ready', urn: mockUrn, progress: 100 }
              : f
          ))

          const updatedFile = { ...cadFile, status: 'ready' as const, urn: mockUrn }
          onFileReady?.(updatedFile)
          
        } catch (uploadError) {
          setFiles(prev => prev.map(f => 
            f.id === cadFile.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
                }
              : f
          ))
        }

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === cadFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : f
        ))
      }
    }

    setUploading(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const retryFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ))

    // Retry logic would go here
  }

  const getStatusIcon = (status: CADFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: CADFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload CAD Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop CAD files here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Supports: {allowedTypes.join(', ')} • Max {maxFileSize}MB
            </p>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Supported Formats Info */}
          <Alert className="mt-4">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>CAD Support:</strong> AutoCAD (DWG/DXF), STEP/STP, IGES, STL, OBJ, Revit (RVT), IFC, and more. 
              Files will be processed for 3D viewing in the browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(file.status)}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                        </span>
                        <span>{file.progress}%</span>
                      </div>
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {file.error}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => retryFile(file.id)}
                        >
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  {file.status === 'ready' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFileReady?.(file)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View 3D
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}