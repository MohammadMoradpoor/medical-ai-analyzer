'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { reportsApi, authApi } from '@/lib/api'
import { MedicalReport } from '@/types'
import { Activity, Upload, FileText, AlertCircle, CheckCircle, Clock, XCircle, X, Trash2, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { UploadModal } from '@/components/ui/UploadModal'

type TabType = 'overview'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const fetchReports = async () => {
    try {
      const data = await reportsApi.list()
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    } finally {
      setIsLoading(false)
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
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'Critical'
      case 'urgent':
        return 'Urgent'
      case 'attention_needed':
        return 'Attention Needed'
      case 'normal':
        return 'Normal'
      default:
        return severity
    }
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



  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
            <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical AI Analyzer</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-sm transition-all hover:shadow-md"
            >
              <Upload className="h-4 w-4" />
              New Analysis
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <NotificationDropdown />
            <SettingsDropdown />
            <div className="h-8 w-px bg-gray-300"></div>
            <UserDropdown />
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full">
          
          {/* Stats Overview - Professional */}
          {(
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-gray-200">
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
          )}

            {/* Tab Content */}
          <div className="bg-white shadow-sm border-t border-gray-200">
              <div>
                  {/* Search and Filters - Professional */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by filename or type..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Status:</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer"
                        >
                          <option value="all">All</option>
                          <option value="completed">Completed</option>
                          <option value="processing">Processing</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Severity:</label>
                        <select
                          value={severityFilter}
                          onChange={(e) => setSeverityFilter(e.target.value)}
                          className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer"
                        >
                          <option value="all">All</option>
                          <option value="normal">Normal</option>
                          <option value="attention_needed">Attention</option>
                          <option value="urgent">Urgent</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-bold text-gray-900">All Reports</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-semibold">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-700">Per page:</label>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                            className="px-2 py-1 text-xs font-semibold text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                    </div>
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
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Report ID</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">File Name</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Report Type</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Upload Date</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">File Type</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Duration</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">Severity</th>
                            <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {paginatedReports.map((report) => (
                            <tr 
                              key={report.id} 
                              onClick={() => {
                                if (report.analysis_status === 'completed') {
                                  router.push(`/reports/${report.id}`)
                                } else if (report.analysis_status === 'failed') {
                                  router.push(`/reports/${report.id}?tab=agent-logs`)
                                }
                              }}
                              className={`hover:bg-blue-50 transition-all ${
                                report.analysis_status !== 'processing' ? 'cursor-pointer' : ''
                              }`}
                            >
                              <td className="px-3 py-2.5">
                                <code className="text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {report.id.substring(0, 8)}...
                                </code>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-semibold text-gray-900 text-sm">{report.file_name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                {report.report_type ? (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                    {String(report.report_type)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-gray-600 font-medium">
                                {new Date(report.upload_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="px-3 py-2.5">
                                {report.file_name && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold uppercase">
                                    {String(report.file_name.split('.').pop() || '').toUpperCase()}
                                  </span>
                                )}
                              </td>
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
                              <td className="px-3 py-2.5">
                                {report.severity_level ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${getSeverityColor(report.severity_level)}`}>
                                    {getSeverityIcon(report.severity_level)}
                                    {getSeverityLabel(report.severity_level)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs font-medium">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center">
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
                                    title="Delete report"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
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
    </div>
  )
}

