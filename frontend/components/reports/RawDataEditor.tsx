'use client'

import { useState, useEffect } from 'react'
import { FileText, Edit3, Save, X, RefreshCw, User, Calendar, Stethoscope, TestTube, Plus, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface RawDataEditorProps {
  data: any
  reportId: string
  onSave: (data: any) => Promise<void>
  onReprocess: () => Promise<void>
}

interface TestResult {
  test_name: string
  value: string
  unit: string
  reference_range: string
  category?: string
  flag?: string
  is_normal?: boolean
}

// InputField component خارج از RawDataEditor برای جلوگیری از re-render
const InputField = ({ label, value, onChange, disabled, icon: Icon, placeholder, isEditing }: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={!isEditing || disabled}
      placeholder={placeholder}
      className={`block w-full px-3 py-2 text-sm rounded-lg transition-all ${
        isEditing 
          ? 'border border-gray-300 bg-white text-gray-900 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500' 
          : 'border border-gray-200 bg-gray-50 text-gray-700'
      } placeholder-gray-400`}
    />
  </div>
)

export function RawDataEditor({ data, reportId, onSave, onReprocess }: RawDataEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  
  // Form data states
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [testDate, setTestDate] = useState('')
  const [reportType, setReportType] = useState('')
  const [labName, setLabName] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])

  useEffect(() => {
    if (data) {
      // Parse data into form fields
      setPatientName(data.patient_info?.name || '')
      setPatientAge(data.patient_info?.age || '')
      setPatientGender(data.patient_info?.gender || '')
      setTestDate(data.report_info?.test_date || '')
      setReportType(data.report_info?.report_type || '')
      setLabName(data.report_info?.lab_name || '')
      setDoctorName(data.report_info?.doctor_name || '')
      setDoctorNotes(data.doctor_notes || '')
      setTestResults(data.test_results || [])
    }
  }, [data])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset to original data
    if (data) {
      setPatientName(data.patient_info?.name || '')
      setPatientAge(data.patient_info?.age || '')
      setPatientGender(data.patient_info?.gender || '')
      setTestDate(data.report_info?.test_date || '')
      setReportType(data.report_info?.report_type || '')
      setLabName(data.report_info?.lab_name || '')
      setDoctorName(data.report_info?.doctor_name || '')
      setDoctorNotes(data.doctor_notes || '')
      setTestResults(data.test_results || [])
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Build updated data object
      const updatedData = {
        patient_info: {
          name: patientName,
          age: patientAge,
          gender: patientGender
        },
        report_info: {
          test_date: testDate,
          report_type: reportType,
          lab_name: labName,
          doctor_name: doctorName
        },
        doctor_notes: doctorNotes,
        test_results: testResults,
        abnormal_findings: data.abnormal_findings || [],
        extraction_notes: data.extraction_notes || []
      }
      
      await onSave(updatedData)
      setIsEditing(false)
      toast.success('Changes saved successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReprocess = async () => {
    try {
      setIsReprocessing(true)
      await onReprocess()
      
      // Show success message
      toast.success('Reprocessing started! Redirecting to dashboard...', {
        duration: 2000
      })
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to reprocess')
      setIsReprocessing(false)
    }
  }

  const addTestResult = () => {
    setTestResults([...testResults, {
      test_name: '',
      value: '',
      unit: '',
      reference_range: '',
      category: '',
      flag: 'N',
      is_normal: true
    }])
  }

  const removeTestResult = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index))
  }

  const updateTestResult = (index: number, field: keyof TestResult, value: any) => {
    const updated = [...testResults]
    updated[index] = { ...updated[index], [field]: value }
    setTestResults(updated)
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
    <div className="bg-white">
      {/* Compact Action Bar */}
      {!isEditing ? (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleReprocess}
            disabled={isReprocessing}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isReprocessing ? 'animate-spin' : ''}`} />
            {isReprocessing ? 'Processing...' : 'Reprocess'}
          </button>
        </div>
      ) : (
        <div className="px-5 py-3 bg-yellow-50 border-b-2 border-yellow-300 flex items-center justify-between">
          <span className="text-sm font-bold text-yellow-900 flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Editing Mode - Make your changes below
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Content - Compact */}
      <div className="p-5 space-y-4 bg-gray-50">
        
        {/* Patient Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Patient Information
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Patient Name"
              value={patientName}
              onChange={setPatientName}
              icon={User}
              placeholder="e.g., John Doe"
              isEditing={isEditing}
            />
            <InputField
              label="Age"
              value={patientAge}
              onChange={setPatientAge}
              placeholder="e.g., 45"
              isEditing={isEditing}
            />
            <InputField
              label="Gender"
              value={patientGender}
              onChange={setPatientGender}
              placeholder="e.g., Male"
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* Report Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            Report Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Test Date"
              value={testDate}
              onChange={setTestDate}
              icon={Calendar}
              placeholder="e.g., 2025-10-27"
              isEditing={isEditing}
            />
            <InputField
              label="Report Type"
              value={reportType}
              onChange={setReportType}
              placeholder="e.g., Blood Test"
              isEditing={isEditing}
            />
            <InputField
              label="Laboratory Name"
              value={labName}
              onChange={setLabName}
              placeholder="e.g., City Medical Lab"
              isEditing={isEditing}
            />
            <InputField
              label="Doctor Name"
              value={doctorName}
              onChange={setDoctorName}
              icon={Stethoscope}
              placeholder="e.g., Dr. Smith"
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* Doctor Notes */}
        {doctorNotes && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              Doctor's Notes
            </h4>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              disabled={!isEditing}
              rows={5}
              className={`block w-full px-4 py-3 border-2 ${
                isEditing
                  ? 'border-purple-300 bg-white text-gray-900 font-medium'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              } rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none`}
              placeholder="Doctor's observations and recommendations..."
            />
          </div>
        )}

        {/* Test Results Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
              <TestTube className="h-4 w-4 text-orange-600" />
              Test Results ({testResults.length})
            </h4>
            {isEditing && (
              <button
                onClick={addTestResult}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Test
              </button>
            )}
          </div>
          
          {testResults.length > 0 ? (
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Test Name</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Value</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Range</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Category</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Flag</th>
                    {isEditing && (
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {testResults.map((test, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={test.test_name}
                          onChange={(e) => updateTestResult(index, 'test_name', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1.5 text-sm rounded font-semibold transition-all ${
                            isEditing
                              ? 'border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500'
                              : 'border-transparent bg-transparent text-gray-800'
                          }`}
                          placeholder="Test name"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={test.value}
                          onChange={(e) => updateTestResult(index, 'value', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1.5 text-sm rounded font-bold transition-all ${
                            isEditing
                              ? 'border border-gray-300 bg-white text-blue-900 focus:ring-1 focus:ring-blue-500'
                              : 'border-transparent bg-transparent text-blue-700'
                          }`}
                          placeholder="Value"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={test.unit}
                          onChange={(e) => updateTestResult(index, 'unit', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1.5 text-xs rounded font-medium transition-all ${
                            isEditing
                              ? 'border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500'
                              : 'border-transparent bg-transparent text-gray-600'
                          }`}
                          placeholder="Unit"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={test.reference_range}
                          onChange={(e) => updateTestResult(index, 'reference_range', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1.5 text-xs rounded font-medium transition-all ${
                            isEditing
                              ? 'border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500'
                              : 'border-transparent bg-transparent text-gray-600'
                          }`}
                          placeholder="4.0-10.0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={test.category || ''}
                          onChange={(e) => updateTestResult(index, 'category', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1.5 text-xs rounded font-medium transition-all ${
                            isEditing
                              ? 'border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500'
                              : 'border-transparent bg-transparent text-gray-600'
                          }`}
                          placeholder="Category"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          test.flag === 'H' ? 'bg-red-500 text-white' :
                          test.flag === 'L' ? 'bg-blue-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {test.flag || 'N'}
                        </span>
                      </td>
                      {isEditing && (
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeTestResult(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-10 text-center bg-white">
              <TestTube className="h-10 w-10 mx-auto mb-3 text-orange-300" />
              <p className="text-sm text-gray-600 font-medium">No test results available</p>
            </div>
          )}
        </div>

        {/* Note برای Editing - Compact */}
        {isEditing && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r p-3">
            <p className="text-xs text-blue-900 font-medium">
              After saving, click <strong>"Reprocess"</strong> to update analysis with your changes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

