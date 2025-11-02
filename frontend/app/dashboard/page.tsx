'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { reportsApi, authApi } from '@/lib/api'
import { MedicalReport } from '@/types'
import { Activity, Upload, FileText, AlertCircle, CheckCircle, Clock, XCircle, X, Trash2, ArrowRight, Search, ChevronLeft, ChevronRight, RefreshCw, MessageCircle, Zap, Home } from 'lucide-react'
import toast from '@/lib/toast'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { UploadModal } from '@/components/ui/UploadModal'
import { ProfessionalSelect } from '@/components/ui/ProfessionalSelect'
import { usePageTransition } from '@/contexts/PageTransitionContext'

type TabType = 'overview'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { startNavigation } = usePageTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reportId: string; fileName: string }>({
    isOpen: false,
    reportId: '',
    fileName: ''
  })
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [chatCounts, setChatCounts] = useState<Record<string, {conversations: number, messages: number}>>({})
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Check URL parameter for upload
    const tabParam = searchParams?.get('tab')
    if (tabParam === 'upload') {
      setUploadModalOpen(true)
    }
    
    fetchReports()
  }, [])

  // Auto-refresh for processing reports
  useEffect(() => {
    // Only auto-refresh if there are processing reports and auto-refresh is enabled
    const hasProcessingReports = reports.some(r => r.analysis_status === 'processing' || r.analysis_status === 'pending')
    
    if (!autoRefresh || !hasProcessingReports) {
      return
    }
    
    // Auto-refresh every 3 seconds when there are processing reports
    const interval = setInterval(() => {
      fetchReports()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [reports, autoRefresh])

  const fetchReports = async () => {
    try {
      const data = await reportsApi.list()
      setReports(data || [])
      fetchChatCounts()
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChatCounts = async () => {
    try {
      console.log('[Dashboard] Fetching chat counts...')
      const counts = await reportsApi.getAllChatCounts()
      console.log('[Dashboard] Chat counts received:', counts)
      setChatCounts(counts || {})
    } catch (error) {
      console.error('[Dashboard] Failed to load chat counts:', error)
      setChatCounts({})
    }
  }

  const handleDelete = async () => {
    try {
      await reportsApi.delete(deleteModal.reportId)
      toast.success('Report deleted successfully')
      fetchReports()
    } catch (error: any) {
      let errorMsg = 'Failed to delete report'
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail
        errorMsg = typeof detail === 'string' ? detail : (detail[0]?.msg || JSON.stringify(detail))
      } else if (error?.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
    }
  }

  // Filter and search reports
  const filteredReports = reports.filter(report => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      report.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.report_type && report.report_type.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || report.analysis_status === statusFilter
    
    // Severity filter
    const matchesSeverity = severityFilter === 'all' || report.severity_level === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, severityFilter])

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'attention_needed':
        return 'bg-yellow-100 text-yellow-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
      case 'urgent':
        return <AlertCircle className="h-5 w-5" />
      case 'attention_needed':
        return <Clock className="h-5 w-5" />
      case 'normal':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDING'
      case 'processing':
        return 'PROCESSING'
      case 'completed':
        return 'COMPLETED'
      case 'failed':
        return 'FAILED'
      default:
        return status.toUpperCase()
    }
  }

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'CRITICAL'
      case 'urgent':
        return 'URGENT'
      case 'attention_needed':
        return 'ATTENTION NEEDED'
      case 'normal':
        return 'NORMAL'
      default:
        return severity?.toUpperCase() || 'UNKNOWN'
    }
  }


  const formatReportType = (reportType?: string) => {
    if (!reportType) return 'Unknown'
    
    // Special cases for proper medical terminology
    const specialCases: Record<string, string> = {
      'chest_xray': 'Chest X-ray',
      'chest_x_ray': 'Chest X-ray',
      'xray': 'X-ray',
      'x_ray': 'X-ray',
      'clinical_photograph': 'Clinical Photograph',
      'blood_test': 'Blood Test',
      'lab_report': 'Lab Report',
      'medical_examination_report': 'Medical Examination Report',
      'ct_scan': 'CT Scan',
      'mri_scan': 'MRI Scan',
      'ultrasound': 'Ultrasound',
      'dental_xray': 'Dental X-ray',
      'dental_x_ray': 'Dental X-ray'
    }
    
    // Check if it's a special case
    const normalized = reportType.toLowerCase().replace(/\s+/g, '_')
    if (specialCases[normalized]) {
      return specialCases[normalized]
    }
    
    // Default: Replace underscores with spaces and title case
    return reportType
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—'
    
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    } else {
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          fetchReports()
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reportId: '', fileName: '' })}
        onConfirm={handleDelete}
        title="Delete Report?"
        message={`Are you sure you want to delete "${deleteModal.fileName}"? This action cannot be undone and will permanently remove the report and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Medical AI Analyzer</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-sm transition-all hover:shadow-md"
            >
              <Upload className="h-4 w-4" />
              Upload Report
            </button>
            
            {/* Auto-refresh indicator & toggle */}
            {reports.some(r => r.analysis_status === 'processing' || r.analysis_status === 'pending') && (
              <>
                <div className="h-8 w-px bg-gray-300"></div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    autoRefresh 
                      ? 'bg-green-50 text-green-700 border-2 border-green-300' 
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  }`}
                  title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin text-green-600' : ''}`} />
                  <span className="text-xs font-bold">
                    {autoRefresh ? 'Auto-Refreshing...' : 'Auto-Refresh Off'}
                  </span>
                </button>
              </>
            )}
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Home Button - Navigate to Public Page */}
            <button
              onClick={() => {
                startNavigation()
                router.push('/')
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Go to home page"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            
            <div className="h-8 w-px bg-gray-300"></div>
            <NotificationDropdown />
            <SettingsDropdown />
            <div className="h-8 w-px bg-gray-300"></div>
            <UserDropdown />
          </div>
        </div>

      </div>

      {/* Main Content - Professional Scrollbar */}
      <div className="flex-1 overflow-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="w-full">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</div>
                  <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completed</div>
                  <div className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.analysis_status === 'completed').length}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
                <div className="p-2 bg-red-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Critical</div>
                  <div className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.severity_level === 'critical').length}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Processing</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {reports.filter(r => r.analysis_status === 'processing').length}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Duration</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const completedReports = reports.filter(r => r.analysis_status === 'completed' && r.processing_duration)
                      if (completedReports.length === 0) return '—'
                      const avgSeconds = completedReports.reduce((sum, r) => sum + (r.processing_duration || 0), 0) / completedReports.length
                      return formatDuration(Math.round(avgSeconds))
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Errors</div>
                  <div className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.analysis_status === 'failed').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Filters - Compact و حرفه‌ای */}
          <div className="bg-white shadow-sm border-t border-gray-200">
              <div>
                  <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      {/* Left: Title & Info */}
                      <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold text-gray-900">All Reports</h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                          {filteredReports.length}
                        </span>
                        <span className="text-xs text-gray-500">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length}
                        </span>
                      </div>

                      {/* Right: Compact Filters */}
                      <div className="flex items-center gap-2">
                        {/* Search - Professional Style Matching Dropdowns */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="min-w-[180px] pl-9 pr-9 px-3 py-2 text-xs font-semibold border-2 border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-400"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Clear search"
                            >
                              <X className="h-3.5 w-3.5 text-gray-500" />
                            </button>
                          )}
                        </div>

                        {/* Status Filter - Professional Custom Dropdown */}
                        <ProfessionalSelect
                          value={statusFilter}
                          onChange={setStatusFilter}
                          options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'processing', label: 'Processing' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'failed', label: 'Failed' }
                          ]}
                        />

                        {/* Severity Filter - Professional Custom Dropdown */}
                        <ProfessionalSelect
                          value={severityFilter}
                          onChange={setSeverityFilter}
                          options={[
                            { value: 'all', label: 'All Severity' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'attention_needed', label: 'Attention Needed' },
                            { value: 'urgent', label: 'Urgent' },
                            { value: 'critical', label: 'Critical' }
                          ]}
                        />

                        {/* Per Page - Professional Custom Dropdown */}
                        <ProfessionalSelect
                          value={itemsPerPage.toString()}
                          onChange={(val) => {
                            setItemsPerPage(Number(val))
                            setCurrentPage(1)
                          }}
                          options={[
                            { value: '10', label: '10 per page' },
                            { value: '25', label: '25 per page' },
                            { value: '50', label: '50 per page' },
                            { value: '100', label: '100 per page' }
                          ]}
                        />

                        {/* Clear */}
                        {(searchQuery || statusFilter !== 'all' || severityFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('')
                              setStatusFilter('all')
                              setSeverityFilter('all')
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Clear all filters"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-white">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {reports.length === 0 ? 'No reports yet' : 'No matching reports'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {reports.length === 0 ? 'Upload your first report' : 'Try adjusting filters'}
                      </p>
                      {reports.length === 0 && (
                        <button
                          onClick={() => setUploadModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Report
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '3%' }}>#</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '25%' }}>File Name</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '14%' }}>Report Type</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '12%' }}>Severity</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '13%' }}>Status</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '9%' }}>Upload Date</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '7%' }}>Duration</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '5%' }}>File Type</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '7%' }}>File Size</th>
                            <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={{ width: '4%' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {paginatedReports.map((report, index) => (
                            <tr 
                              key={report.id} 
                              onClick={() => {
                                if (report.analysis_status === 'completed') {
                                  startNavigation()
                                  router.push(`/reports/${report.id}`)
                                } else if (report.analysis_status === 'failed') {
                                  startNavigation()
                                  router.push(`/reports/${report.id}?tab=agent-logs`)
                                }
                              }}
                              className={`hover:bg-blue-50 transition-all ${
                                report.analysis_status !== 'processing' ? 'cursor-pointer' : ''
                              }`}
                            >
                              {/* 0. Row Number */}
                              <td className="px-3 py-2.5 text-center">
                                <span className="text-xs font-semibold text-gray-500">
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </span>
                              </td>
                              
                              {/* 1. File Name (with conversation badge) */}
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-semibold text-gray-900 text-sm">{report.file_name}</span>
                                  {chatCounts[report.id] && chatCounts[report.id].conversations > 0 && (
                                    <div className="relative group flex-shrink-0">
                                      <span 
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold cursor-pointer"
                                      >
                                        <MessageCircle className="h-3 w-3" />
                                        {chatCounts[report.id].conversations}
                                      </span>
                                      {/* Professional Hover Tooltip - Matches Screenshot */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                        <div className="font-semibold">{chatCounts[report.id].conversations} conversation{chatCounts[report.id].conversations !== 1 ? 's' : ''}</div>
                                        <div className="text-gray-300 text-[11px] mt-0.5">{chatCounts[report.id].messages} message{chatCounts[report.id].messages !== 1 ? 's' : ''}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              
                              {/* 2. Report Type */}
                              <td className="px-3 py-2.5">
                                  {report.report_type ? (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                    {formatReportType(report.report_type)}
                                    </span>
                                  ) : report.analysis_status === 'completed' ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                    No Data
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              
                              {/* 3. Severity */}
                              <td className="px-3 py-2.5">
                                {report.severity_level ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${getSeverityColor(report.severity_level)}`}>
                                    {getSeverityIcon(report.severity_level)}
                                    {getSeverityLabel(report.severity_level)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              
                              {/* 4. Status - Simple and clean */}
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  {report.analysis_status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                  {report.analysis_status === 'processing' && <Clock className="h-4 w-4 text-blue-600 animate-spin" />}
                                  {report.analysis_status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                    report.analysis_status === 'completed' ? 'bg-green-100 text-green-800' :
                                    report.analysis_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    report.analysis_status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {getStatusText(report.analysis_status)}
                                  </span>
                                </div>
                              </td>
                              
                              {/* 5. Upload Date */}
                              <td className="px-3 py-2.5 text-xs text-gray-600 font-medium">
                                {new Date(report.upload_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </td>
                              
                              {/* 6. Duration */}
                              <td className="px-3 py-2.5">
                                {report.processing_duration !== undefined && report.processing_duration !== null ? (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-700 font-mono">
                                      {formatDuration(report.processing_duration)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              
                              {/* 7. File Type */}
                              <td className="px-3 py-2.5">
                                {report.file_name && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold uppercase">
                                    {String(report.file_name.split('.').pop() || '').toUpperCase()}
                                  </span>
                                )}
                              </td>
                              
                              {/* 8. File Size */}
                              <td className="px-3 py-2.5 text-right">
                                {report.file_size ? (
                                  <span className="text-xs font-semibold text-gray-700 font-mono">
                                    {report.file_size < 1024 * 1024 
                                      ? `${(report.file_size / 1024).toFixed(1)} KB` 
                                      : `${(report.file_size / 1024 / 1024).toFixed(2)} MB`
                                    }
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              
                              {/* 9. Actions */}
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center">
                                  <div className="relative group">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDeleteModal({
                                        isOpen: true,
                                        reportId: report.id,
                                        fileName: report.file_name
                                      })
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                    {/* Professional Hover Tooltip - Positioned to avoid scroll */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-8 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                      Delete report
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Controls - Professional */}
                  {filteredReports.length > 0 && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 font-medium">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

