'use client'

import { Upload, FileText, Users, BarChart, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionBar() {
  const router = useRouter()

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-center gap-6 py-3 px-4">
        <button
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Upload Report</span>
        </button>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">View Reports</span>
        </button>
        
        <button
          onClick={() => router.push('/analytics')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <BarChart className="h-4 w-4" />
          <span className="text-sm font-medium">Analytics</span>
        </button>
      </div>
    </div>
  )
}

