'use client'

import { useState } from 'react'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  Brain,
  Zap
} from 'lucide-react'

interface AgentLog {
  id: string
  agent_type: string
  operation: string
  status: string
  started_at: string
  completed_at: string
  duration_ms: number
  input_data: any
  output_data: any
  error_message?: string
  model_used: string
  tokens_used?: number
  cost_estimate?: number
}

interface AgentLogsViewerProps {
  logs: AgentLog[]
}

export function AgentLogsViewer({ logs }: AgentLogsViewerProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Map<string, Set<string>>>(new Map())

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-900 font-semibold mb-2">No Execution Logs Found</p>
        <p className="text-red-700 text-sm">
          The analysis failed before generating any logs. This may indicate a system error or configuration issue.
        </p>
        <div className="mt-4 p-3 bg-red-100 rounded text-left">
          <p className="text-xs text-red-800 mb-1"><strong>Possible causes:</strong></p>
          <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
            <li>File could not be read or processed</li>
            <li>OpenAI API key not configured</li>
            <li>Network connectivity issues</li>
            <li>Invalid file format or corrupted file</li>
          </ul>
        </div>
      </div>
    )
  }

  const toggleLog = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const toggleSection = (logId: string, sectionId: string) => {
    setExpandedSections(prev => {
      const newMap = new Map(prev)
      const logSections = newMap.get(logId) || new Set()
      if (logSections.has(sectionId)) {
        logSections.delete(sectionId)
      } else {
        logSections.add(sectionId)
      }
      newMap.set(logId, logSections)
      return newMap
    })
  }

  const isSectionExpanded = (logId: string, sectionId: string) => {
    return expandedSections.get(logId)?.has(sectionId) || false
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
      case 'failure':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
      case 'failure':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getAgentTypeIcon = (agentType: string) => {
    switch (agentType) {
      case 'document_extractor':
        return <FileText className="h-4 w-4" />
      case 'medical_analyzer':
        return <Brain className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getAgentTypeLabel = (agentType: string) => {
    switch (agentType) {
      case 'document_extractor':
        return 'Document Extractor'
      case 'medical_analyzer':
        return 'Medical Analyzer'
      default:
        return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const isExpanded = expandedLogs.has(log.id)
        
        return (
          <div key={log.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Log Header - Clickable */}
            <div
              onClick={() => toggleLog(log.id)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Expand/Collapse Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(log.status)}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getAgentTypeIcon(log.agent_type)}
                    <span className="font-semibold text-gray-900 text-sm">
                      {getAgentTypeLabel(log.agent_type)}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">
                      {log.operation}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.status}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(log.duration_ms)}</span>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-200">
                {/* Execution Timeline */}
                <div className="mt-3 bg-white rounded-lg border border-gray-200 p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Execution Timeline</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span className="font-mono">{formatTimestamp(log.started_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-mono">{formatTimestamp(log.completed_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold">{formatDuration(log.duration_ms)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning/Thoughts */}
                {log.output_data && (log.output_data.reasoning || log.output_data.summary || log.output_data.overall_assessment) && (
                  <div className="bg-white rounded-lg border border-blue-200 p-3">
                    <div
                      onClick={() => toggleSection(log.id, 'thoughts')}
                      className="flex items-center justify-between cursor-pointer hover:bg-blue-50 -m-3 p-3 rounded-t-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <h4 className="text-xs font-semibold text-gray-900">AI Thoughts & Reasoning</h4>
                      </div>
                      {isSectionExpanded(log.id, 'thoughts') ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {isSectionExpanded(log.id, 'thoughts') && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {log.output_data.reasoning || 
                           log.output_data.summary ||
                           log.output_data.overall_assessment?.summary ||
                           'No reasoning provided'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Extracted Data (for document extractor) */}
                {log.agent_type === 'document_extractor' && log.output_data && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div
                      onClick={() => toggleSection(log.id, 'extraction')}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-t-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-xs font-semibold text-gray-900">Extracted Data</h4>
                        {log.output_data.test_results && (
                          <span className="text-xs text-gray-500">
                            ({log.output_data.test_results.length} tests found)
                          </span>
                        )}
                      </div>
                      {isSectionExpanded(log.id, 'extraction') ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {isSectionExpanded(log.id, 'extraction') && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {log.output_data.report_info && (
                          <div className="text-xs">
                            <div className="font-semibold text-gray-700 mb-1">Report Information</div>
                            <div className="ml-2 space-y-0.5 text-gray-600">
                              {Object.entries(log.output_data.report_info).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.output_data.test_results && log.output_data.test_results.length > 0 && (
                          <div className="text-xs">
                            <div className="font-semibold text-gray-700 mb-1">Test Results Extracted</div>
                            <div className="ml-2 space-y-1">
                              {log.output_data.test_results.slice(0, 5).map((test: any, idx: number) => (
                                <div key={idx} className="text-gray-600">
                                  • {test.test_name}: {test.value} {test.unit}
                                </div>
                              ))}
                              {log.output_data.test_results.length > 5 && (
                                <div className="text-gray-500">
                                  ... and {log.output_data.test_results.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Results (for medical analyzer) */}
                {log.agent_type === 'medical_analyzer' && log.output_data && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div
                      onClick={() => toggleSection(log.id, 'analysis')}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-t-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <h4 className="text-xs font-semibold text-gray-900">Analysis Results</h4>
                      </div>
                      {isSectionExpanded(log.id, 'analysis') ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {isSectionExpanded(log.id, 'analysis') && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        {/* Overall Assessment */}
                        {log.output_data.overall_assessment && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 mb-2">Overall Assessment</div>
                            <div className="ml-2 space-y-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Severity:</span>
                                <span className={`px-2 py-0.5 rounded ${
                                  log.output_data.overall_assessment.severity_level === 'critical' ? 'bg-red-100 text-red-800' :
                                  log.output_data.overall_assessment.severity_level === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                  log.output_data.overall_assessment.severity_level === 'attention_needed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {log.output_data.overall_assessment.severity_level}
                                </span>
                              </div>
                              {log.output_data.overall_assessment.has_abnormalities && (
                                <div className="text-orange-700">
                                  ⚠️ Abnormalities detected
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Abnormal Findings */}
                        {log.output_data.abnormal_findings && log.output_data.abnormal_findings.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 mb-2">
                              Abnormal Findings ({log.output_data.abnormal_findings.length})
                            </div>
                            <div className="ml-2 space-y-1.5">
                              {log.output_data.abnormal_findings.map((finding: any, idx: number) => (
                                <div key={idx} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                                  <div className="font-medium text-red-900">{finding.finding}</div>
                                  <div className="text-red-700 mt-0.5">{finding.explanation}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {log.output_data.recommendations && log.output_data.recommendations.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 mb-2">
                              Recommendations ({log.output_data.recommendations.length})
                            </div>
                            <ul className="ml-2 space-y-1 text-xs text-gray-600">
                              {log.output_data.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-blue-600 mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message - Always show for failed logs */}
                {(log.error_message || log.status === 'error' || log.status === 'failure') && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <h4 className="text-sm font-semibold text-red-900">Error Details</h4>
                    </div>
                    <div className="ml-7">
                      <p className="text-sm text-red-800 mb-2 font-medium">
                        {log.error_message || 'An error occurred during processing'}
                      </p>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs text-red-700">
                          <strong>Operation:</strong> {log.operation}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          <strong>Agent Type:</strong> {log.agent_type}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          <strong>Failed at:</strong> {new Date(log.completed_at || log.started_at).toLocaleString()}
                        </p>
                      </div>
                      {log.output_data && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-xs text-red-700 mb-1">
                            <strong>Additional Context:</strong>
                          </p>
                          <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div
                    onClick={() => toggleSection(log.id, 'technical')}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-t-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-600" />
                      <h4 className="text-xs font-semibold text-gray-900">Technical Details</h4>
                    </div>
                    {isSectionExpanded(log.id, 'technical') ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {isSectionExpanded(log.id, 'technical') && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">Log ID:</span>
                        <span className="font-mono text-[10px]">{log.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Model:</span>
                        <span>{log.model_used}</span>
                      </div>
                      {log.tokens_used && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tokens Used:</span>
                          <span>{log.tokens_used.toLocaleString()}</span>
                        </div>
                      )}
                      {log.cost_estimate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Estimated Cost:</span>
                          <span>${log.cost_estimate.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

