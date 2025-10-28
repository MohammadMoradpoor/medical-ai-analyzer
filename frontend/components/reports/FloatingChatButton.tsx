'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'

interface FloatingChatButtonProps {
  onClick: () => void
  hasNewSuggestions?: boolean
  messageCount?: number
}

export function FloatingChatButton({ onClick, hasNewSuggestions = false, messageCount = 0 }: FloatingChatButtonProps) {
  const [isPulsing, setIsPulsing] = useState(true)

  useEffect(() => {
    // Stop pulsing after first click
    if (messageCount > 0) {
      setIsPulsing(false)
    }
  }, [messageCount])

  return (
    <button
      onClick={onClick}
      className={`fixed right-6 bottom-6 z-30 group ${isPulsing ? 'animate-bounce' : ''}`}
      title="Ask AI about your report"
    >
      {/* Main Button */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Button Core */}
        <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full shadow-2xl transition-all group-hover:scale-110">
          <MessageCircle className="h-8 w-8 text-white" />
          
          {/* Badge for message count */}
          {messageCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
              {messageCount > 9 ? '9+' : messageCount}
            </div>
          )}
          
          {/* Sparkle indicator for new suggestions */}
          {hasNewSuggestions && messageCount === 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-yellow-900" />
            </div>
          )}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-20 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
          <div className="text-sm font-bold">💬 Ask AI Questions</div>
          <div className="text-xs text-gray-300">Get instant answers about your report</div>
          {/* Arrow */}
          <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900" />
          </div>
        </div>
      </div>
    </button>
  )
}

