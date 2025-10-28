'use client'

import { useState, useEffect, useRef } from 'react'
import { reportsApi } from '@/lib/api'
import { ChatMessage, SuggestedQuestions } from '@/types'
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Brain,
  X,
  Lightbulb,
  Minimize2,
  Maximize2,
  User2,
  Bot,
  ChevronDown
} from 'lucide-react'
import toast from '@/lib/toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { MarkdownText } from '@/components/ui/MarkdownText'

interface ChatPanelProps {
  reportId: string
  reportContext?: any
  isOpen: boolean
  onClose: () => void
  onMessageCountChange?: (count: number) => void
}

export function ChatPanel({ reportId, reportContext, isOpen, onClose, onMessageCountChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [conversationId] = useState<string>(() => {
    // Generate unique conversation ID for this session
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
  const [showMedicalTerms, setShowMedicalTerms] = useState<Record<string, string>>({})
  const [latestFollowUp, setLatestFollowUp] = useState<string[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [expandedMedicalTerms, setExpandedMedicalTerms] = useState<Record<string, boolean>>({})
  const [allConversations, setAllConversations] = useState<any[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string>(conversationId)
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null)
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadChatHistory()
      loadSuggestedQuestions()
      // Also load conversations if opening in fullscreen
      if (isFullscreen) {
        loadAllConversations()
      }
    }
  }, [reportId, isOpen])

  useEffect(() => {
    if (isFullscreen && isOpen) {
      loadAllConversations()
    }
  }, [isFullscreen, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Update message count badge on floating button
    if (onMessageCountChange) {
      onMessageCountChange(messages.length)
    }
  }, [messages, onMessageCountChange])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const history = await reportsApi.getChatHistory(reportId, activeConversationId)
      setMessages(history)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const loadAllConversations = async () => {
    try {
      const allHistory = await reportsApi.getChatHistory(reportId)
      
      // Group messages by conversation_id
      const conversationsMap = new Map<string, any>()
      
      allHistory.forEach((msg: ChatMessage) => {
        const convId = (msg as any).conversation_id || conversationId
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            messages: [],
            lastMessage: msg.created_at,
            firstQuestion: ''
          })
        }
        const conv = conversationsMap.get(convId)!
        conv.messages.push(msg)
        if (new Date(msg.created_at) > new Date(conv.lastMessage)) {
          conv.lastMessage = msg.created_at
        }
        // Get first user question as title
        if (msg.role === 'user' && !conv.firstQuestion) {
          conv.firstQuestion = msg.content
        }
      })
      
      // Convert to array and sort by last message time
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime())
      
      setAllConversations(conversations)
      
      // Titles already set from firstQuestion - no LLM generation needed
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const deleteConversation = async (convId: string) => {
    try {
      console.log('=== DELETE CONVERSATION DEBUG ===')
      console.log('Conversation ID:', convId)
      console.log('Report ID:', reportId)
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1')
      
      const result = await reportsApi.clearChatHistory(reportId, convId)
      console.log('Delete successful! Result:', result)
      
      // Remove from list immediately
      setAllConversations(prev => prev.filter(c => c.id !== convId))
      
      // If deleting active conversation, start new one
      if (convId === activeConversationId) {
        startNewConversation()
      }
      
      toast.success(`Conversation deleted (${result.deleted_count || 0} messages)`)
      
      // Reload conversations after a short delay
      setTimeout(() => {
        if (isFullscreen) {
          loadAllConversations()
        }
      }, 500)
      
    } catch (error: any) {
      console.error('=== DELETE CONVERSATION ERROR ===')
      console.error('Conversation ID that failed:', convId)
      console.error('Full error object:', error)
      console.error('Error message:', error?.message)
      console.error('Error code:', error?.code)
      console.error('Error response:', error?.response)
      console.error('Error response data:', error?.response?.data)
      console.error('Error stack:', error?.stack)
      
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to delete conversation'
      toast.error(`Delete failed: ${errorMsg}`)
    }
  }

  const switchConversation = (convId: string) => {
    setActiveConversationId(convId)
    const conversation = allConversations.find(c => c.id === convId)
    if (conversation) {
      setMessages(conversation.messages)
    }
  }

  const startNewConversation = () => {
    const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setActiveConversationId(newConvId)
    setMessages([])
    setLatestFollowUp([])
    setShowMedicalTerms({})
    
    // Reload suggested questions for new conversation
    loadSuggestedQuestions()
  }

  const loadSuggestedQuestions = async () => {
    try {
      setLoadingSuggestions(true)
      const result = await reportsApi.getSuggestedQuestions(reportId)
      setSuggestedQuestions(result.questions || [])
    } catch (error) {
      console.error('Error loading suggested questions:', error)
      // Set fallback questions (3 questions)
      setSuggestedQuestions([
        "What do my test results mean?",
        "Are any of my results concerning?",
        "What should I do next?"
      ])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const sendMessage = async (questionText?: string) => {
    const question = questionText || inputMessage.trim()
    
    if (!question) return

    // Clear input immediately
    setInputMessage('')

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp_user_${Date.now()}`,
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    // Create streaming AI message with "AI is thinking..." placeholder
    const streamingMessageId = `temp_ai_${Date.now()}`
    const streamingMessage: ChatMessage = {
      id: streamingMessageId,
      role: 'assistant',
      content: '__THINKING__',  // Placeholder that will be replaced
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, streamingMessage])

    setIsLoading(true)
    let isFirstChunk = true

    try {
      // Use streaming API
      await reportsApi.sendChatMessageStreaming(
        reportId,
        question,
        activeConversationId,
        // onChunk: Update streaming message with new content
        (chunk: string) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === streamingMessageId) {
              // On first chunk, replace "AI is thinking..." with actual content
              if (isFirstChunk || msg.content === '__THINKING__') {
                isFirstChunk = false
                return { ...msg, content: chunk }
              }
              // Subsequent chunks: append
              return { ...msg, content: msg.content + chunk }
            }
            return msg
          }))
        },
        // onComplete: Replace temp message with final saved message
        async (messageId: string) => {
          setIsLoading(false)
          
          // Update message with final ID
          setMessages(prev => prev.map(msg =>
            msg.id === streamingMessageId
              ? { ...msg, id: messageId }
              : msg
          ))
          
          // Fetch the complete message with metadata (sources, medical terms, etc.)
          try {
            const history = await reportsApi.getChatHistory(reportId, activeConversationId)
            const completeMessage = history.find((m: ChatMessage) => m.id === messageId)
            
            if (completeMessage) {
              // Update with complete data
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? completeMessage
                  : msg
              ))
              
              // Add medical terms to dictionary (only in fullscreen)
              if (completeMessage.medical_terms_explained && isFullscreen) {
                setShowMedicalTerms(prev => ({
                  ...prev,
                  ...completeMessage.medical_terms_explained
                }))
              }
            }
          } catch (error) {
            console.error('Error fetching complete message:', error)
          }
          
          // Reload conversations to update sidebar (if in fullscreen)
          if (isFullscreen) {
            setTimeout(() => {
              loadAllConversations()
            }, 500)
          }
          
          // Focus back on input
          inputRef.current?.focus()
        },
        // onError: Handle errors
        (error: string) => {
          setIsLoading(false)
          toast.error(error || 'Failed to send message')
          // Remove streaming message on error
          setMessages(prev => prev.filter(m => m.id !== streamingMessageId))
        }
      )

    } catch (error: any) {
      setIsLoading(false)
      toast.error(error?.response?.data?.detail || error?.message || 'Failed to send message')
      // Remove both temp messages on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== streamingMessageId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    // Shift+Enter allows new line (default textarea behavior)
  }

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(messageId)
    toast.success('Copied to clipboard')
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null)
    }, 2000)
  }

  const handleClearConfirm = async () => {
    try {
      await reportsApi.clearChatHistory(reportId, conversationId)
      setMessages([])
      setLatestFollowUp([])
      setShowMedicalTerms({})
      toast.success('Chat history cleared')
    } catch (error) {
      toast.error('Failed to clear chat history')
    }
  }

  const handleFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      await reportsApi.submitChatFeedback(reportId, messageId, isHelpful)
      
      // Update local message state to show feedback was submitted
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_helpful: isHelpful, user_rating: isHelpful ? 5 : 1 } 
          : msg
      ))
      
      toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded', {
        icon: isHelpful ? '✓' : '✓'
      })
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
  }

  if (!isOpen) return null

  // Determine window size based on fullscreen mode
  const windowClasses = isFullscreen
    ? "fixed inset-4 z-50 flex flex-col bg-white rounded-2xl border-2 border-purple-200 overflow-hidden shadow-2xl"
    : "fixed right-6 bottom-6 w-[480px] z-50 flex flex-col bg-white rounded-2xl border-2 border-purple-200 overflow-hidden shadow-2xl"
  
  const windowStyle = isFullscreen
    ? {}
    : { top: '6rem', maxHeight: 'calc(100vh - 8rem)' }

  return (
    <>
      {/* Backdrop/Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Chat Window - Responsive positioning */}
      <div className={windowClasses} style={windowStyle}>
        <div className="flex h-full">
          {/* Sidebar - Only in fullscreen mode */}
          {isFullscreen && (
            <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-700">
                <button
                  onClick={startNewConversation}
                  className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  New Chat
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {allConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredConversationId(conv.id)}
                    onMouseLeave={() => setHoveredConversationId(null)}
                  >
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        activeConversationId === conv.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-2 mb-1">
                            {conv.firstQuestion || 'New conversation'}
                          </div>
                          <div className="text-xs opacity-70 flex items-center gap-1.5">
                            <span>{conv.messages.length} msgs</span>
                            <span>•</span>
                            <span>{new Date(conv.lastMessage).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Delete Button (appears on hover) */}
                    {hoveredConversationId === conv.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConversationId(conv.id)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-700 hover:bg-red-500 text-gray-400 hover:text-white rounded-md transition-all duration-200"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {allConversations.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No previous conversations</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-white p-1.5 rounded-lg flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">Ask AI About Your Report</h3>
              <p className="text-xs text-purple-100 truncate">Get instant answers and explanations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 0 && (
              <>
                <span className="text-xs text-purple-100 font-medium px-2">
                  {messages.length}
                </span>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-1.5 hover:bg-purple-500 rounded-lg text-white transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-purple-500 rounded-lg text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-purple-500 rounded-lg text-white transition-colors"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suggested Questions (shown when empty) */}
        {messages.length === 0 && !isLoading && (
          <div className="p-4 border-b border-purple-100 bg-gradient-to-br from-purple-50 to-white flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-900">Suggested Questions</h4>
            </div>
            
            {loadingSuggestions ? (
              <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating questions...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="w-full text-left px-3 py-2.5 bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5 group-hover:text-purple-600" />
                      <span className="text-sm text-gray-800 group-hover:text-purple-900 font-medium leading-snug">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow-up Suggestions (shown after AI response) */}
        {latestFollowUp.length > 0 && messages.length > 0 && !isLoading && (
          <div className="px-4 py-2.5 border-b border-purple-100 bg-purple-50 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-3.5 w-3.5 text-purple-600" />
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Follow-up</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {latestFollowUp.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  className="px-2.5 py-1.5 bg-white hover:bg-purple-100 border border-purple-300 hover:border-purple-500 rounded-md text-xs font-medium text-purple-800 hover:text-purple-900 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - Scrollable area */}
        <div className={`flex-1 bg-gray-50 min-h-0 ${messages.length === 0 && !isLoading ? 'flex items-center justify-center' : 'overflow-y-auto px-6 py-4 space-y-4'}`}>
        {messages.length === 0 && !isLoading ? (
          <div className="text-center px-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              Ask questions about your medical report. Get instant, context-aware answers with citations and explanations.
            </p>
          </div>
        ) : (
          <>
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar Icon */}
            <div className="flex-shrink-0">
              {message.role === 'user' ? (
                // Professional user avatar (sleek modern design)
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 ring-offset-1">
                  <User2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              ) : (
                // AI assistant avatar with bot icon
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-purple-200 ring-offset-1">
                  <Bot className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
            
            <div className={`flex-1 ${message.role === 'user' ? 'max-w-[75%]' : 'max-w-[80%]'}`}>
              {/* Message Bubble */}
              <div className={`rounded-xl px-3.5 py-2.5 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white border-2 border-purple-200 text-gray-900 shadow-sm'
              }`}>
                {/* Message Content with Markdown */}
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <>
                      {message.content === '__THINKING__' ? (
                        /* Show "AI is thinking..." while waiting for first chunk */
                        <div className="flex items-center gap-2 text-purple-700 italic">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      ) : (
                        <>
                          <MarkdownText content={message.content} />
                          {/* Streaming indicator - blinking cursor */}
                          {message.id.startsWith('temp_ai_') && message.content && (
                            <span className="inline-block w-0.5 h-4 bg-purple-600 ml-0.5 animate-pulse"></span>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                </div>

                {/* AI Response Metadata - Only show for completed messages */}
                {message.role === 'assistant' && !message.id.startsWith('temp_ai_') && (
                  <div className="mt-3 pt-3 border-t border-purple-100 space-y-2">
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Sources:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medical Terms - Collapsible */}
                    {message.medical_terms_explained && Object.keys(message.medical_terms_explained).length > 0 && (
                      <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                        <button
                          onClick={() => setExpandedMedicalTerms(prev => ({
                            ...prev,
                            [message.id]: !prev[message.id]
                          }))}
                          className="w-full px-2 py-1.5 text-xs font-bold text-blue-900 flex items-center justify-between hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <Brain className="h-3.5 w-3.5" />
                            <span>Medical Terms Explained ({Object.keys(message.medical_terms_explained).length})</span>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                            expandedMedicalTerms[message.id] ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {expandedMedicalTerms[message.id] && (
                          <div className="px-2 pb-2 space-y-1">
                            {Object.entries(message.medical_terms_explained).map(([term, definition]) => (
                              <div key={term} className="text-xs bg-white rounded p-1.5 border border-blue-100">
                                <span className="font-bold text-blue-900">{term}:</span>{' '}
                                <span className="text-blue-800">{definition}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Footer - Actions and Timestamp (hide while streaming) */}
                {!message.id.startsWith('temp_') && (
                <div className="mt-2 flex items-center justify-between">
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className={`p-1 rounded transition-all ${
                        copiedMessageId === message.id
                          ? message.role === 'user'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-700'
                          : message.role === 'user'
                            ? 'hover:bg-blue-500 text-white opacity-70 hover:opacity-100'
                            : 'hover:bg-purple-100 text-purple-600'
                      }`}
                      title={copiedMessageId === message.id ? "Copied!" : "Copy"}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {message.role === 'assistant' && (
                      <>
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className={`p-1 rounded transition-all ${
                            message.is_helpful === true
                              ? 'bg-green-500 text-white shadow-md'
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title={message.is_helpful === true ? "Marked as helpful" : "Helpful"}
                        >
                          <ThumbsUp className={`h-3.5 w-3.5 ${message.is_helpful === true ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className={`p-1 rounded transition-all ${
                            message.is_helpful === false
                              ? 'bg-red-500 text-white shadow-md'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                          title={message.is_helpful === false ? "Marked as not helpful" : "Not helpful"}
                        >
                          <ThumbsDown className={`h-3.5 w-3.5 ${message.is_helpful === false ? 'fill-current' : ''}`} />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Timestamp and Tokens */}
                  <div className="flex items-center gap-2">
                    {/* Token usage (subtle, partially obfuscated) */}
                    {message.role === 'assistant' && message.tokens_used && (
                      <span className="text-xs text-gray-400 font-mono">
                        {Math.floor(message.tokens_used / 100)}•• tokens
                      </span>
                    )}
                    {/* Timestamp */}
                    <span className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                )}
              </div>

              {/* Follow-up Suggestions (only on latest AI message) */}
              {message.role === 'assistant' && 
               index === messages.length - 1 && 
               message.follow_up_suggestions && 
               message.follow_up_suggestions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    You might also want to ask:
                  </div>
                  {message.follow_up_suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-400 rounded-lg text-xs text-purple-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      → {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator removed - streaming message shows blinking cursor instead */}

        <div ref={messagesEndRef} />
        </>
        )}
        </div>

        {/* Medical Terms Dictionary (only in fullscreen mode) */}
        {isFullscreen && Object.keys(showMedicalTerms).length > 0 && (
          <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-2 border-blue-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-1.5 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-sm font-bold text-blue-900">
                  Medical Terms Dictionary
                </h4>
                <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                  {Object.keys(showMedicalTerms).length}
                </span>
              </div>
              <button
                onClick={() => setShowMedicalTerms({})}
                className="p-1.5 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors"
                title="Clear all terms"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(showMedicalTerms).map(([term, definition]) => (
                <div key={term} className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm">
                    <div className="font-bold text-blue-900 mb-1">{term}</div>
                    <div className="text-gray-700 leading-relaxed">{definition}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 bg-white border-t-2 border-purple-200 flex-shrink-0">
          <div className="flex items-start gap-2">
            <textarea
              ref={inputRef as any}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your report..."
              disabled={isLoading}
              rows={1}
              className="flex-1 px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">Enter</kbd> to send, 
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono ml-1">Shift+Enter</kbd> for new line
            </span>
          </div>
        </div>

        {/* Professional Medical Disclaimer */}
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex-shrink-0">
          <p className="text-xs text-yellow-900 flex items-center gap-1.5 leading-tight">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              <strong>Disclaimer:</strong> AI responses are for informational purposes only. 
              Always consult your healthcare provider for medical advice.
            </span>
          </p>
        </div>
          </div>
          {/* End Main Chat Area */}
        </div>
        {/* End Flex Container */}
      </div>
      
      {/* Clear Chat Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearConfirm}
        title="Clear Chat History?"
        message="Are you sure you want to delete all chat messages? This action cannot be undone and will permanently remove the entire conversation history."
        confirmText="Clear All Messages"
        cancelText="Cancel"
        type="danger"
      />
      
      {/* Delete Conversation Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConversationId !== null}
        onClose={() => setDeleteConversationId(null)}
        onConfirm={() => {
          if (deleteConversationId) {
            deleteConversation(deleteConversationId)
            setDeleteConversationId(null)
          }
        }}
        title="Delete Conversation?"
        message="Are you sure you want to delete this conversation? This will permanently remove all messages in this chat."
        confirmText="Delete Conversation"
        cancelText="Cancel"
        type="danger"
      />
    </>
  )
}

