'use client'

import { useState, useEffect } from 'react'
import { Code, Edit3, Save, X, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface RawDataEditorProps {
  data: any
  reportId: string
  onSave: (data: any) => Promise<void>
  onReprocess: () => Promise<void>
}

export function RawDataEditor({ data, reportId, onSave, onReprocess }: RawDataEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState('')
  const [originalData, setOriginalData] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (data) {
      const formatted = JSON.stringify(data, null, 2)
      setOriginalData(formatted)
      setEditedData(formatted)
    }
  }, [data])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedData(originalData)
    setIsEditing(false)
    setIsValid(true)
  }

  const handleChange = (value: string) => {
    setEditedData(value)
    
    // Validate JSON
    try {
      JSON.parse(value)
      setIsValid(true)
    } catch (e) {
      setIsValid(false)
    }
  }

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Invalid JSON format')
      return
    }

    try {
      setIsSaving(true)
      const parsedData = JSON.parse(editedData)
      await onSave(parsedData)
      setOriginalData(editedData)
      setIsEditing(false)
      toast.success('Extracted data saved successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to save data')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedData)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReprocess = async () => {
    try {
      setIsReprocessing(true)
      await onReprocess()
      toast.success('Report is being reprocessed...', {
        icon: '🔄',
        duration: 3000
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to reprocess')
    } finally {
      setIsReprocessing(false)
    }
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-sm text-yellow-800 font-medium">No extracted data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-white" />
            <h3 className="text-base font-bold text-white">Raw Extracted Data</h3>
            {!isValid && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                Invalid JSON
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs font-semibold rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleReprocess}
                  disabled={isReprocessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${isReprocessing ? 'animate-spin' : ''}`} />
                  {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 hover:bg-gray-400 text-white text-xs font-semibold rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isValid || isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor/Viewer */}
      <div className="relative">
        {isEditing ? (
          <div className="relative">
            <textarea
              value={editedData}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full p-4 font-mono text-xs leading-relaxed bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 ${
                isValid ? 'focus:ring-green-500' : 'focus:ring-red-500'
              } resize-none`}
              style={{ minHeight: '500px', maxHeight: '700px' }}
              spellCheck={false}
            />
            {!isValid && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Invalid JSON Syntax
              </div>
            )}
          </div>
        ) : (
          <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed overflow-x-auto"
            style={{ minHeight: '500px', maxHeight: '700px', overflowY: 'auto' }}
          >
            {editedData}
          </pre>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="font-medium">
            {isEditing ? 'Editing Mode' : 'View Mode'}
          </span>
          <span className="text-gray-400">•</span>
          <span>
            Lines: {editedData.split('\n').length}
          </span>
          <span className="text-gray-400">•</span>
          <span>
            Size: {new Blob([editedData]).size} bytes
          </span>
        </div>
        
        {isEditing && (
          <div className="text-xs text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded font-mono">Ctrl+Enter</kbd> to save
          </div>
        )}
      </div>
    </div>
  )
}

