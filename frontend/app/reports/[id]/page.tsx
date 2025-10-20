'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { reportsApi } from '@/lib/api'
import { ReportAnalysis } from '@/types'
import { Activity, AlertCircle, CheckCircle, FileText, TrendingUp, Clock, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { AgentLogsViewer } from '@/components/reports/AgentLogsViewer'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string
  const [report, setReport] = useState<ReportAnalysis | null>(null)
  const [agentLogs, setAgentLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'agent-logs']))

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


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!report) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical AI Analyzer</h1>
              <p className="text-xs text-gray-500">Report Details</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
            >
              ← Back to Dashboard
            </button>
            
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <SettingsDropdown />
              <div className="h-8 w-px bg-gray-300 mx-1"></div>
              <UserDropdown />
            </div>
          </div>
        </div>

      </div>

      {/* Main Content - Professional Two-Column Layout */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full">
          
          {/* Page Title Section */}
          <div className="bg-white border-b-2 border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Medical Analysis Report</h1>
                <p className="text-sm text-gray-600 font-medium">
                  Detailed AI-powered analysis results and recommendations
                </p>
              </div>
              {report.status === 'failed' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-300 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-bold text-red-900">Analysis Failed</span>
                </div>
              )}
              {report.status === 'completed' && report.severity_level && (
                <div className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg ${getSeverityColor(report.severity_level)}`}>
                  {getSeverityIcon(report.severity_level)}
                  <span className="text-sm font-bold">{getSeverityLabel(report.severity_level)}</span>
                </div>
              )}
            </div>
            {/* Report ID Badge */}
            <div className="flex items-center gap-2 px-6">
              <span className="text-xs font-bold text-gray-500 uppercase">Report ID:</span>
              <code className="text-xs font-mono text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                {reportId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportId)
                  toast.success('Report ID copied to clipboard')
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy ID
              </button>
            </div>
          </div>

          {/* Content Layout */}
          <div className="p-6 space-y-4">
            
            {/* Summary Section */}
            {report.summary && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-bold text-gray-900">Analysis Summary</h3>
                    </div>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{report.summary}</p>
                    
                    {/* Abnormal Findings */}
                    {report.abnormal_findings && report.abnormal_findings.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Abnormal Findings ({report.abnormal_findings.length})
                        </h4>
                        {report.abnormal_findings.map((finding, index) => (
                          <div key={index} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg">
                            <p className="text-sm font-bold text-gray-900 mb-1">{finding.finding}</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{finding.explanation}</p>
                            {finding.action_needed && (
                              <p className="text-xs text-red-700 font-bold mt-2 flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {finding.action_needed}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No Abnormalities */}
                    {(!report.abnormal_findings || report.abnormal_findings.length === 0) && (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-3 mt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-900 font-bold">No abnormal findings detected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Results Section */}
              {report.test_analysis && report.test_analysis.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <h3 className="text-base font-bold text-gray-900">Test Results ({report.test_analysis.length})</h3>
                    </div>
                  </div>
                  <div className="px-4 py-4 space-y-2">
                    {report.test_analysis.map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          test.is_normal
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm">{test.test_name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-lg font-bold text-gray-900">{test.value}</span>
                              <span className="text-xs text-gray-600 font-medium">Normal: {test.reference_range}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            test.is_normal ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {test.is_normal ? 'Normal' : test.severity || 'Abnormal'}
                          </span>
                        </div>
                        {test.interpretation && (
                          <p className="text-xs text-gray-700 leading-relaxed mt-2 font-medium">
                            {test.interpretation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Recommendations Section */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-base font-bold text-gray-900">Recommendations ({report.recommendations?.length || 0})</h3>
                  </div>
                </div>
                <div className="px-4 py-4 space-y-2.5">
                  {(report.recommendations || []).map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2.5 p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border-l-4 border-green-500">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-900 leading-relaxed font-medium">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Execution Logs Section - Always Visible */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">Agent Execution Logs</h3>
                    {agentLogs.length > 0 && (
                      <span className="text-xs text-gray-600 font-bold">({agentLogs.length} steps)</span>
                    )}
                  </div>
                </div>
                <div className="px-4 py-4">
                  {isLoadingLogs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm font-medium">Loading execution logs...</p>
                    </div>
                  ) : (
                    <AgentLogsViewer logs={agentLogs} />
                  )}
                </div>
              </div>

            {/* Medical Disclaimer */}
            <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-r-lg p-4">
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                <strong className="font-bold text-sm">⚕️ Medical Disclaimer:</strong> This analysis is for informational purposes only and should not be considered as medical advice. Please consult with a qualified healthcare professional for proper interpretation and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
