'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { reportsApi } from '@/lib/api'
import { Activity, Upload, FileText, X, Search, Bell, Settings, User } from 'lucide-react'
import toast from '@/lib/toast'
import { usePageTransition } from '@/contexts/PageTransitionContext'

export default function UploadPage() {
  const router = useRouter()
  const { startNavigation } = usePageTransition()
  
  // Redirect to dashboard upload tab
  useEffect(() => {
    startNavigation()
    router.push('/dashboard?tab=upload')
  }, [router, startNavigation])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/tiff']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PDF or image.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must not exceed 10MB.')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const result = await reportsApi.upload(selectedFile)
      toast.success('File uploaded successfully. Analysis in progress...')
      startNavigation()
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Header */}
      <div className="bg-gray-900 text-white shadow-lg">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded">
              <Activity className="h-5 w-5" />
              <span className="font-bold text-sm">MA</span>
            </div>
            <span className="text-lg font-semibold">Medical AI Analyzer</span>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports, tests, analysis..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => toast('Notifications feature coming soon!')}
              className="p-2 hover:bg-gray-800 rounded-lg relative"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                startNavigation()
                router.push('/dashboard')
              }}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div 
              onClick={() => {
                startNavigation()
                router.push('/dashboard')
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">User</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 px-6 border-t border-gray-700">
          <nav className="flex gap-8">
            <button onClick={() => {
              startNavigation()
              router.push('/dashboard')
            }} className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white">
              Home
            </button>
            <button className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-t">
              Upload
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Medical Test Report
            </h1>
            <p className="text-gray-600">
              Upload PDF or image of your medical test results for AI-powered analysis
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {!selectedFile ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-sm text-gray-500">
                  Supports PDF, PNG, JPG, JPEG (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading and analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload & Analyze
                    </>
                  )}
                </button>

                <p className="mt-4 text-sm text-gray-500 text-center">
                  Analysis may take 1-2 minutes
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• File must be clear and readable</li>
              <li>• Supports blood tests, urine tests, and other medical lab reports</li>
              <li>• Analysis results are for informational purposes only</li>
              <li>• Your data is stored securely and confidentially</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
