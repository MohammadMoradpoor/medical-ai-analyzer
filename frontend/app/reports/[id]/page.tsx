'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { reportsApi } from '@/lib/api'
import { ReportAnalysis } from '@/types'
import { Activity, AlertCircle, CheckCircle, FileText, TrendingUp, Clock, ChevronDown, ChevronRight, ArrowRight, TestTube, MessageCircle, Copy, Check, Printer, Download, Settings } from 'lucide-react'
import toast from '@/lib/toast'
import { AgentLogsViewer } from '@/components/reports/AgentLogsViewer'
import { RawDataEditor } from '@/components/reports/RawDataEditor'
import { ChatPanel } from '@/components/reports/ChatPanel'
import { FloatingChatButton } from '@/components/reports/FloatingChatButton'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import { LoadingProgressBar } from '@/components/ui/LoadingProgressBar'
import { usePageTransition } from '@/contexts/PageTransitionContext'

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { startNavigation } = usePageTransition()
  const reportId = params?.id as string
  const [report, setReport] = useState<ReportAnalysis | null>(null)
  const [agentLogs, setAgentLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isRawDataExpanded, setIsRawDataExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'abnormal', 'recommendations', 'tests']))
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessageCount, setChatMessageCount] = useState(0)
  const [reportIdCopied, setReportIdCopied] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Check URL parameter to auto-expand agent logs
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'agent-logs') {
      setExpandedSections(new Set(['summary', 'tests', 'recommendations', 'agent-logs']))
    }
    
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const fetchReport = async () => {
    try {
      const data = await reportsApi.get(reportId)
      setReport(data)
      // Fetch agent logs too
      fetchAgentLogs()
      // Fetch chat message count
      fetchChatCount()
    } catch (error: any) {
      let errorMsg = 'Error loading report'
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail
        errorMsg = typeof detail === 'string' ? detail : (detail[0]?.msg || 'Failed to load')
      } else if (error?.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChatCount = async () => {
    try {
      const history = await reportsApi.getChatHistory(reportId)
      setChatMessageCount(history.length)
    } catch (error) {
      console.error('Error loading chat count:', error)
    }
  }

  const fetchAgentLogs = async () => {
    try {
      setIsLoadingLogs(true)
      const logs = await reportsApi.getAgentLogs(reportId)
      setAgentLogs(logs)
    } catch (error) {
      console.error('Error loading agent logs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleSaveExtractedData = async (data: any) => {
    await reportsApi.updateExtractedData(reportId, data)
    // Update local state
    if (report) {
      setReport({ ...report, extracted_data: data })
    }
  }

  const handleReprocess = async () => {
    await reportsApi.reprocess(reportId)
    // Redirect handled by RawDataEditor component
  }

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true)
    try {
      await reportsApi.downloadPDF(reportId)
      toast.success('PDF report downloaded successfully', { icon: '✓' })
    } catch (error) {
      toast.error('Failed to download PDF report')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'attention_needed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
      case 'urgent':
        return <AlertCircle className="h-6 w-6" />
      case 'normal':
        return <CheckCircle className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'Critical - Immediate Attention Required'
      case 'urgent':
        return 'Urgent - Prompt Attention Needed'
      case 'attention_needed':
        return 'Attention Needed'
      case 'normal':
        return 'Normal - No Concerns'
      default:
        return 'Status Unknown'
    }
  }


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Show top loading bar during data fetch */}
      <LoadingProgressBar variant="top-bar" isNavigating={isLoading} />
      
      {/* Show minimal UI while loading or if report not found */}
      {!report ? (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            {isLoading ? (
              <p className="text-gray-600">Loading report...</p>
            ) : (
              <p className="text-gray-600">Report not found</p>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Compact Header با contrast بهتر */}
      <div className="bg-white border-b-2 border-gray-200 shadow-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                startNavigation()
                router.push('/dashboard')
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              title="Back to Dashboard"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Medical Analysis Report</h1>
                <p className="text-xs text-gray-500 font-medium">AI-Powered Diagnostics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <SettingsDropdown />
            <div className="h-8 w-px bg-gray-300"></div>
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Quick Info & Status */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-3">
            
            {/* Severity Badge */}
            {report.severity_level ? (
              <div className={`rounded-xl p-4 border-2 ${getSeverityColor(report.severity_level)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(report.severity_level)}
                  <span className="text-xs font-bold uppercase tracking-wide">Status</span>
                </div>
                <p className="text-sm font-bold leading-tight">{getSeverityLabel(report.severity_level)}</p>
              </div>
            ) : report.status === 'completed' && (
              <div className="rounded-xl p-4 border-2 bg-yellow-100 border-yellow-300">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-yellow-800">Warning</span>
                </div>
                <p className="text-sm font-bold leading-tight text-yellow-900">No Data Extracted</p>
              </div>
            )}

            {/* Report Meta */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
              <h3 className="text-xs font-bold text-gray-600 uppercase mb-2">Report Information</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Report ID</span>
                  <code className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded border">{reportId.substring(0, 8)}...</code>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className={`font-bold ${
                    report.status === 'completed' ? 'text-green-600' :
                    report.status === 'processing' ? 'text-blue-600' :
                    report.status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Critical</span>
                  <span className={`font-bold ${report.is_critical ? 'text-red-600' : 'text-green-600'}`}>
                    {report.is_critical ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Abnormalities</span>
                  <span className={`font-bold ${report.has_abnormalities ? 'text-orange-600' : 'text-green-600'}`}>
                    {report.has_abnormalities ? 'Detected' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-blue-600 font-bold mb-1">Abnormal Findings</div>
                <div className="text-xl font-bold text-blue-900">
                  {report.abnormal_findings?.length || 0}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 font-bold mb-1">Recommendations</div>
                <div className="text-xl font-bold text-green-900">
                  {report.recommendations?.length || 0}
                </div>
              </div>
            </div>

            {/* Test Results Count */}
            {report.test_analysis && report.test_analysis.length > 0 ? (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-xs text-purple-600 font-bold mb-1">Test Results</div>
                <div className="text-xl font-bold text-purple-900 mb-2">
                  {report.test_analysis.length} Tests
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-500 text-white rounded font-bold">
                    {report.test_analysis.filter(t => t.is_normal).length} Normal
                  </span>
                  <span className="px-2 py-1 bg-red-500 text-white rounded font-bold">
                    {report.test_analysis.filter(t => !t.is_normal).length} Abnormal
                  </span>
                </div>
              </div>
            ) : report.status === 'completed' && (
              <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300">
                <div className="text-xs text-yellow-700 font-bold mb-1">Data Status</div>
                <div className="text-base font-bold text-yellow-900 mb-1">
                  No Tests Found
                </div>
                <p className="text-xs text-yellow-800">
                  No medical data was extracted from this file
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportId)
                  setReportIdCopied(true)
                  toast.success('Report ID copied!')
                  
                  // Reset after 2 seconds
                  setTimeout(() => {
                    setReportIdCopied(false)
                  }, 2000)
                }}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  reportIdCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {reportIdCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Report ID
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Report
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF || report.status !== 'completed'}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingPDF ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area - Compact & Information Dense */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            
            {/* Warning: No Data Extracted - Only for lab reports without data */}
            {report.status === 'completed' && !report.extracted_data?.is_medical_imaging && (!report.test_analysis || report.test_analysis.length === 0) && !report.severity_level && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-orange-500 rounded-r-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 p-3 rounded-xl flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      No Medical Data Extracted
                    </h3>
                    <p className="text-sm text-orange-800 mb-3 leading-relaxed">
                      The AI was unable to extract medical test data from this file. This could happen if:
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1.5 list-disc list-inside">
                      <li>The file is not a medical test report</li>
                      <li>The image quality is too low or blurry</li>
                      <li>The document format is not recognized</li>
                      <li>The file contains non-medical information</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-lg border-2 border-orange-300">
                      <p className="text-sm font-bold text-gray-900 mb-1">💡 What you can do:</p>
                      <p className="text-xs text-gray-700">
                        Try uploading a clearer image or a different medical test report (PDF format recommended).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Info: Medical Imaging Analysis Failed */}
            {report.status === 'completed' && report.extracted_data?.is_medical_imaging && !report.severity_level && (
              <div className="bg-gradient-to-r from-red-100 to-rose-100 border-l-4 border-red-500 rounded-r-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 p-3 rounded-xl flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      Medical Imaging Analysis Failed
                    </h3>
                    <p className="text-sm text-red-800 mb-3 leading-relaxed">
                      The AI attempted to analyze this medical image ({report.extracted_data.imaging_type}) but the analysis could not be completed. This could happen if:
                    </p>
                    <ul className="text-sm text-red-800 space-y-1.5 list-disc list-inside">
                      <li>The image quality is too poor for analysis</li>
                      <li>The imaging orientation or positioning is unclear</li>
                      <li>The image file is corrupted or incomplete</li>
                      <li>The AI service encountered a temporary error</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-lg border-2 border-red-300">
                      <p className="text-sm font-bold text-gray-900 mb-1">💡 What you can do:</p>
                      <p className="text-xs text-gray-700">
                        Try re-uploading a higher quality image, ensure proper positioning, or try uploading from a different source. For best results, use DICOM format or high-resolution images.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 1. Summary Card - Expanded by Default */}
            {report.summary && (
                <div className="bg-gradient-to-br from-blue-50 via-sky-25 to-white rounded-xl border-2 border-blue-300 overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('summary')}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 flex items-center gap-2 hover:from-blue-600 hover:to-sky-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-white" />
                    <h3 className="text-sm font-bold text-white">AI Analysis Summary</h3>
                    <div className="ml-auto">
                      {expandedSections.has('summary') ? (
                        <ChevronDown className="h-4 w-4 text-white" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                  {expandedSections.has('summary') && (
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-800 leading-snug font-medium">{report.summary}</p>
                      
                      {/* Quick Findings Summary */}
                      <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium">Abnormalities</div>
                          <div className={`text-lg font-bold ${report.has_abnormalities ? 'text-red-600' : 'text-emerald-600'}`}>
                            {report.abnormal_findings?.length || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium">Critical Issues</div>
                          <div className={`text-lg font-bold ${report.is_critical ? 'text-red-600' : 'text-emerald-600'}`}>
                            {report.is_critical ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Abnormal Findings - Always Expanded (Critical) */}
              {report.abnormal_findings && report.abnormal_findings.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 via-red-25 to-white rounded-xl border-2 border-red-300 overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('abnormal')}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4 text-white" />
                    <h3 className="text-sm font-bold text-white">Abnormal Findings</h3>
                    <span className="px-2 py-0.5 bg-white text-red-600 text-xs font-bold rounded-full">
                      {report.abnormal_findings.length}
                    </span>
                    <div className="ml-auto">
                      {expandedSections.has('abnormal') ? (
                        <ChevronDown className="h-4 w-4 text-white" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                  {expandedSections.has('abnormal') && (
                    <div className="p-3 space-y-2">
                      {report.abnormal_findings.map((finding, index) => (
                        <div key={index} className="bg-white rounded-lg border-2 border-red-200 p-3 hover:border-red-300 transition-colors">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                              <h4 className="font-bold text-red-900 text-sm mb-1">{finding.finding}</h4>
                              <p className="text-xs text-gray-700 leading-snug mb-2">{finding.explanation}</p>
                              {finding.action_needed && (
                                <div className="bg-red-100 rounded px-2 py-1.5 mt-2">
                                  <p className="text-xs text-red-800 font-bold">→ {finding.action_needed}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Test Results - Collapsible */}
              {report.test_analysis && report.test_analysis.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-purple-300 overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('tests')}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-between hover:from-purple-600 hover:to-violet-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-white" />
                      <h3 className="text-sm font-bold text-white">Test Results</h3>
                      <span className="px-2 py-0.5 bg-white text-purple-600 text-xs font-bold rounded-full">
                        {report.test_analysis.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {report.test_analysis.filter(t => t.is_normal).length}
                        </span>
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded font-bold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {report.test_analysis.filter(t => !t.is_normal).length}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-white ${expandedSections.has('tests') ? '' : 'rotate-180'}`} />
                    </div>
                  </button>
                  {expandedSections.has('tests') && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead className="bg-purple-50 border-b-2 border-purple-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-purple-900">Test Name</th>
                          <th className="px-3 py-2 text-right text-xs font-bold text-purple-900">Value</th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-purple-900">Normal Range</th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-purple-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100">
                        {report.test_analysis.map((test, index) => (
                          <tr key={index} className={`hover:bg-purple-50 transition-colors ${!test.is_normal ? 'bg-red-50' : ''}`}>
                            <td className="px-3 py-2.5">
                              <div className="font-bold text-gray-900">{test.test_name}</div>
                              {test.interpretation && (
                                <div className="text-xs text-gray-600 mt-0.5 leading-tight">{test.interpretation}</div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={`text-base font-bold ${!test.is_normal ? 'text-red-700' : 'text-gray-900'}`}>
                                {test.value}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-xs text-gray-600 font-medium">{test.reference_range}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                test.is_normal 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {test.is_normal ? 'Normal' : (test.severity || 'Abnormal')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              )}

            {/* 4. Recommendations - Collapsible, Expanded by Default */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 via-green-25 to-white rounded-xl border-2 border-emerald-200 overflow-hidden shadow-md">
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 flex items-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Medical Recommendations</h3>
                  <span className="px-2 py-0.5 bg-white text-emerald-600 text-xs font-bold rounded-full">
                    {report.recommendations.length}
                  </span>
                  <div className="ml-auto">
                    {expandedSections.has('recommendations') ? (
                      <ChevronDown className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </div>
                </button>
                {expandedSections.has('recommendations') && (
                  <div className="p-3 space-y-1.5">
                    {report.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        <span className="text-emerald-600 font-bold flex-shrink-0">{index + 1}.</span>
                        <span className="text-sm text-gray-800 font-medium leading-snug">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Advanced Details - Technical Section (Collapsed by Default) */}
            <div className="bg-white rounded-xl border-2 border-gray-400 overflow-hidden shadow-md">
              <button
                onClick={() => toggleSection('advanced')}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-slate-100 hover:from-gray-200 hover:to-slate-200 flex items-center gap-3 border-b-2 border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded-lg">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-gray-900">Advanced Details</h3>
                  <p className="text-xs text-gray-600">For technical users and verification</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-semibold">
                    Optional
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    expandedSections.has('advanced') ? '' : '-rotate-90'
                  }`} />
                </div>
              </button>

              {expandedSections.has('advanced') && (
                <div className="p-4 bg-gray-50 space-y-3">
                  
                  {/* AI Processing Log - Nested */}
                  <div className="bg-white rounded-lg border-2 border-purple-300 overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleSection('processing')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-colors"
                    >
                      <Activity className="h-4 w-4 text-white" />
                      <h4 className="text-xs font-bold text-white">AI Processing Log</h4>
                      {agentLogs.length > 0 && (
                        <span className="px-2 py-0.5 bg-white text-purple-600 text-xs font-bold rounded-full">
                          {agentLogs.length} steps
                        </span>
                      )}
                      <div className="ml-auto">
                        <ChevronRight className={`h-3.5 w-3.5 text-white transition-transform ${
                          expandedSections.has('processing') ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                    {expandedSections.has('processing') && (
                      <div className="p-3">
                        {isLoadingLogs ? (
                          <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <p className="text-gray-600 text-xs font-medium">Loading logs...</p>
                          </div>
                        ) : (
                          <AgentLogsViewer logs={agentLogs} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Raw Data View - Nested (Only for Lab Reports) */}
                  {report.extracted_data && !report.extracted_data.is_medical_imaging && (
                    <div className="bg-white rounded-lg border-2 border-gray-400 overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleSection('raw_data')}
                        className="w-full px-3 py-2 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 flex items-center gap-2 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-white" />
                        <h4 className="text-xs font-bold text-white">Raw Data View</h4>
                        <span className="text-xs text-gray-300">(Editable)</span>
                        <div className="ml-auto">
                          <ChevronRight className={`h-3.5 w-3.5 text-white transition-transform ${
                            expandedSections.has('raw_data') ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </button>
                      {expandedSections.has('raw_data') && (
                        <div className="p-3 bg-gray-50">
                          <RawDataEditor
                            data={report.extracted_data}
                            reportId={reportId}
                            onSave={handleSaveExtractedData}
                            onReprocess={handleReprocess}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              )}
            </div>
            
            {/* Medical Imaging Note - Show instead of raw data for imaging */}
            {report.extracted_data && report.extracted_data.is_medical_imaging && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 overflow-hidden shadow-md">
                <div className="px-5 py-4 bg-blue-600 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-white" />
                  <h3 className="text-sm font-bold text-white">Medical Imaging Analysis</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-blue-900 mb-2">
                        {report.extracted_data.imaging_type?.replace(/_/g, ' ').toUpperCase()} Analysis
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        This is a medical imaging study (X-ray, MRI, CT, or Dental). The analysis has been performed using specialized radiological AI protocols. 
                        There is no "raw text data" to extract from imaging studies - the visual analysis results are shown above in the findings sections.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                    <h5 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">ℹ️ About Medical Imaging Analysis</h5>
                    <ul className="text-xs text-gray-700 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Medical images (X-rays, MRI, CT scans) contain <strong>visual information</strong>, not text data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>The AI performs <strong>systematic radiological review</strong> of visible structures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Analysis results are shown in the <strong>findings, impression, and recommendations</strong> sections above</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>There is no "editable raw data" for imaging studies - only the visual analysis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Disclaimer - آخرین بخش */}
            {/* Medical Disclaimer - Compact */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl p-3 shadow-sm">
              <p className="text-xs text-gray-800 leading-snug">
                <strong className="font-bold text-yellow-900">Medical Disclaimer:</strong> This AI analysis is for informational purposes only. Consult a qualified healthcare professional for proper medical interpretation and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Button */}
      <FloatingChatButton 
        onClick={() => setIsChatOpen(true)}
        messageCount={chatMessageCount}
        hasNewSuggestions={chatMessageCount === 0}
      />
      
      {/* Chat Panel Modal */}
      <ChatPanel 
        reportId={reportId}
        reportContext={report}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onMessageCountChange={(count) => setChatMessageCount(count)}
      />
      </>
      )}
    </div>
  )
}
