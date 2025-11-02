'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { MedicalReport } from '@/types'

interface ReportsCacheContextType {
  cachedReports: MedicalReport[] | null
  chatCounts: Record<string, {conversations: number, messages: number}> | null
  setCachedReports: (reports: MedicalReport[]) => void
  setChatCounts: (counts: Record<string, {conversations: number, messages: number}>) => void
  clearCache: () => void
}

const ReportsCacheContext = createContext<ReportsCacheContextType | undefined>(undefined)

export function ReportsCacheProvider({ children }: { children: React.ReactNode }) {
  const [cachedReports, setCachedReports] = useState<MedicalReport[] | null>(null)
  const [chatCounts, setChatCounts] = useState<Record<string, {conversations: number, messages: number}> | null>(null)

  const clearCache = useCallback(() => {
    setCachedReports(null)
    setChatCounts(null)
  }, [])

  const value: ReportsCacheContextType = {
    cachedReports,
    chatCounts,
    setCachedReports,
    setChatCounts,
    clearCache,
  }

  return (
    <ReportsCacheContext.Provider value={value}>
      {children}
    </ReportsCacheContext.Provider>
  )
}

export function useReportsCache() {
  const context = useContext(ReportsCacheContext)
  if (context === undefined) {
    throw new Error('useReportsCache must be used within ReportsCacheProvider')
  }
  return context
}

