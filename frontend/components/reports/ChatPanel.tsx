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
  ChevronDown,
  Search,
  Menu,
  PanelLeft,
  Sidebar,
  Mic,
  Play,
  Pause,
  StopCircle,
  Volume2,
  Plus
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
  const [conversationSearch, setConversationSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const audioCacheRef = useRef<Map<string, string>>(new Map()) // Cache: messageId -> audio URL
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

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

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate new height, minimum 36px, maximum 200px
    const scrollHeight = textarea.scrollHeight
    const newHeight = Math.max(36, Math.min(scrollHeight, 200))
    textarea.style.height = `${newHeight}px`
    
    // Enable scrolling only when at max height
    if (scrollHeight > 200) {
      textarea.style.overflowY = 'auto'
    } else {
      textarea.style.overflowY = 'hidden'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    resizeTextarea(e.target)
  }

  // Auto-resize when inputMessage changes programmatically (suggested questions, etc.)
  useEffect(() => {
    if (inputRef.current) {
      resizeTextarea(inputRef.current)
    }
  }, [inputMessage])

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(messageId)
    toast.success('Copied to clipboard')
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null)
    }, 2000)
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Setup audio visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Start visualization
      visualizeAudio()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        
        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        setAudioLevels([0, 0, 0, 0, 0])
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone error:', err)
      toast.error('Microphone access denied')
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray)
      
      // Sample 5 frequency bands for visualization
      const bands = 5
      const bandSize = Math.floor(bufferLength / bands)
      const levels = []
      
      for (let i = 0; i < bands; i++) {
        const start = i * bandSize
        const end = start + bandSize
        const bandData = dataArray.slice(start, end)
        const average = bandData.reduce((sum, val) => sum + val, 0) / bandSize
        // Normalize to 0-1 range and amplify for visibility
        const normalized = Math.min((average / 255) * 2, 1)
        levels.push(normalized)
      }
      
      setAudioLevels(levels)
      animationFrameRef.current = requestAnimationFrame(updateLevels)
    }

    updateLevels()
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    stopRecording()
    setAudioBlob(null)
    setRecordingTime(0)
    setAudioLevels([0, 0, 0, 0, 0])
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
      audioPlayerRef.current = null
    }
    setPlayingAudio(null)
    setLoadingAudio(null)
  }

  const playMessageAudio = async (messageId: string, text: string) => {
    try {
      // If clicking the same message that's playing, stop it
      if (playingAudio === messageId) {
        stopAllAudio()
        return
      }

      // If clicking while loading the same audio, cancel it
      if (loadingAudio === messageId) {
        stopAllAudio()
        return
      }

      // Stop any other playing/loading audio
      stopAllAudio()

      let audioUrl: string

      // Check cache first (professional optimization)
      if (audioCacheRef.current.has(messageId)) {
        // Use cached audio - instant playback!
        audioUrl = audioCacheRef.current.get(messageId)!
        console.log('[TTS] Using cached audio for message', messageId)
      } else {
        // Set loading state (only if not cached)
        setLoadingAudio(messageId)

        // Request TTS from backend
        const response = await fetch(`http://localhost:5000/api/v1/reports/${reportId}/chat/text-to-speech`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: text.substring(0, 4000) }) // Limit to 4000 chars
        })

        if (!response.ok) {
          throw new Error('TTS failed')
        }

        const audioBlob = await response.blob()
        audioUrl = URL.createObjectURL(audioBlob)
        
        // Cache the audio URL for instant replay
        audioCacheRef.current.set(messageId, audioUrl)
        console.log('[TTS] Cached audio for message', messageId)
        
        // Clear loading state
        setLoadingAudio(null)
      }

      // Create and play audio
      const audio = new Audio(audioUrl)
      audioPlayerRef.current = audio
      setPlayingAudio(messageId)

      audio.onended = () => {
        setPlayingAudio(null)
        audioPlayerRef.current = null
      }

      audio.onerror = () => {
        setPlayingAudio(null)
        setLoadingAudio(null)
        toast.error('Audio playback failed')
        audioPlayerRef.current = null
      }

      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      toast.error('Failed to play audio')
      setPlayingAudio(null)
      setLoadingAudio(null)
      audioPlayerRef.current = null
    }
  }

  // Cleanup audio and cache on unmount
  useEffect(() => {
    return () => {
      stopAllAudio()
      // Revoke all cached audio URLs to prevent memory leaks
      audioCacheRef.current.forEach(url => URL.revokeObjectURL(url))
      audioCacheRef.current.clear()
    }
  }, [])

  // Stop audio when conversation changes
  useEffect(() => {
    stopAllAudio()
  }, [activeConversationId])

  // Stop audio when chat closes
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio()
    }
  }, [isOpen])

  // Clear cache when conversation changes (new messages, different context)
  useEffect(() => {
    // Revoke old cache URLs
    audioCacheRef.current.forEach(url => URL.revokeObjectURL(url))
    audioCacheRef.current.clear()
  }, [activeConversationId, messages.length])

  const sendVoiceMessage = async () => {
    if (!audioBlob) return

    setIsLoading(true)
    
    try {
      // Create form data with audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-message.webm')

      // Upload and transcribe (use base URL without /api/v1 since it's in the path)
      const response = await fetch(`http://localhost:5000/api/v1/reports/${reportId}/chat/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      
      // Clear audio first
      setAudioBlob(null)
      setRecordingTime(0)
      
      // Send the transcribed text as a message
      if (data.transcription && data.transcription.trim()) {
        toast.success(`Transcribed (${data.duration?.toFixed(1)}s)`)
        await sendMessage(data.transcription)
      } else {
        toast.error('No speech detected in audio')
      }
    } catch (error) {
      console.error('Voice message error:', error)
      toast.error('Failed to transcribe voice message')
      setAudioBlob(null)
      setRecordingTime(0)
    } finally {
      setIsLoading(false)
    }
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
      // Find current message
      const currentMessage = messages.find(m => m.id === messageId)
      
      // Toggle: if clicking same button, cancel feedback
      const newValue = currentMessage?.is_helpful === isHelpful ? undefined : isHelpful
      
      await reportsApi.submitChatFeedback(reportId, messageId, isHelpful)
      
      // Update local message state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_helpful: newValue, user_rating: newValue === undefined ? undefined : (newValue ? 5 : 1) } 
          : msg
      ))
      
      if (newValue === undefined) {
        toast.success('Feedback removed')
      } else {
        toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded')
      }
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
          {/* Sidebar - Only in fullscreen mode, with toggle */}
          {isFullscreen && isSidebarOpen && (
            <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-700 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={startNewConversation}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    New Chat
                  </button>
                  {/* Close Sidebar Button - Upper Right Corner */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="ml-2 p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Close sidebar"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Search Conversations - Professional Style */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none placeholder-gray-500 transition-all"
                  />
                  {conversationSearch && (
                    <button
                      onClick={() => setConversationSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conversations List - Professional Scrollbar */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                {allConversations
                  .filter(conv => 
                    conversationSearch === '' || 
                    (conv.firstQuestion && conv.firstQuestion.toLowerCase().includes(conversationSearch.toLowerCase()))
                  )
                  .map((conv) => (
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
                
                {allConversations.filter(conv => 
                  conversationSearch === '' || 
                  (conv.firstQuestion && conv.firstQuestion.toLowerCase().includes(conversationSearch.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{conversationSearch ? 'No matching conversations' : 'No previous conversations'}</p>
                  </div>
                )}
              </div>
              
              {/* Sidebar Footer - Conversation Count */}
              <div className="p-4 border-t border-gray-700">
                <div className="text-center text-xs text-gray-500">
                  {allConversations.length} {allConversations.length === 1 ? 'conversation' : 'conversations'}
                </div>
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Sidebar Toggle Button - Only when sidebar is closed */}
            {isFullscreen && !isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-purple-500 rounded-lg text-white transition-colors mr-1"
                title="Open sidebar"
              >
                <Sidebar className="h-4 w-4" />
              </button>
            )}
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

        {/* Messages - Scrollable area with professional scrollbar */}
        <div className={`flex-1 bg-[#F9FAFB] min-h-0 ${messages.length === 0 && !isLoading ? 'flex flex-col items-center justify-center' : 'overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'}`}>
        {messages.length === 0 && !isLoading ? (
          <div className="text-center px-8 w-full max-w-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto mb-6">
              Ask questions about your medical report. Get instant, context-aware answers with citations and explanations.
            </p>
            
            {/* Suggested Questions Below - Centered */}
            {loadingSuggestions ? (
              <div className="flex items-center justify-center gap-2 text-purple-600 mt-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating questions...</span>
              </div>
            ) : suggestedQuestions.length > 0 && (
              <div className="mt-6 space-y-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(question)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left px-4 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-relaxed">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
          <div className="max-w-4xl mx-auto w-full">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {/* Message Bubble - No Avatars */}
            <div className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 shadow-sm'
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
                
                {/* User Message Timestamp - Inside bubble, bottom right (shows immediately) */}
                {message.role === 'user' && message.created_at && (
                  <div className="mt-2 text-right">
                    <span className="text-xs text-blue-200 opacity-80">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

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

                {/* Message Footer - Different layout for user vs AI */}
                {!message.id.startsWith('temp_') && message.role === 'assistant' && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Play/Stop Audio Button */}
                    <button
                      onClick={() => playMessageAudio(message.id, message.content)}
                      disabled={loadingAudio === message.id}
                      className={`p-1 rounded-md transition-all ${
                        playingAudio === message.id
                          ? 'bg-purple-200 text-purple-700'
                          : loadingAudio === message.id
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-purple-600'
                      }`}
                      title={
                        loadingAudio === message.id 
                          ? "Loading audio..." 
                          : playingAudio === message.id 
                          ? "Stop audio" 
                          : "Play audio"
                      }
                    >
                      {loadingAudio === message.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : playingAudio === message.id ? (
                        <StopCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className={`p-1 rounded-md transition-all ${
                        copiedMessageId === message.id
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={copiedMessageId === message.id ? "Copied!" : "Copy"}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`p-1 rounded-md transition-all ${
                        message.is_helpful === true
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={message.is_helpful === true ? "Marked as helpful" : "Helpful"}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${message.is_helpful === true ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`p-1 rounded-md transition-all ${
                        message.is_helpful === false
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={message.is_helpful === false ? "Marked as not helpful" : "Not helpful"}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${message.is_helpful === false ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Timestamp for AI */}
                  <div className="flex items-center gap-2">
                    {message.tokens_used && (
                      <span className="text-xs text-gray-400 font-mono">
                        {Math.floor(message.tokens_used / 100)}•• tokens
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                )}
              </div>
          </div>
        ))}
        </div>
        <div ref={messagesEndRef} />
        </>
        )
        }
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

        {/* Input Area with Voice Support */}
        <div className="px-6 py-4 bg-[#F9FAFB] flex-shrink-0">
          {/* Voice Recording UI */}
          {isRecording || audioBlob ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-4">
                  {/* Real-time Audio Waveform */}
                  {isRecording && (
                    <div className="flex items-center gap-1 h-10">
                      {audioLevels.map((level, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full transition-all duration-75"
                          style={{
                            height: `${Math.max(level * 32, 4)}px`,
                            opacity: level > 0.05 ? 1 : 0.3
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isRecording ? (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-gray-900">Recording...</span>
                          <span className="text-sm font-mono text-gray-600">{formatRecordingTime(recordingTime)}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">Voice ready to send</span>
                          <span className="text-sm font-mono text-gray-600">{formatRecordingTime(recordingTime)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-md"
                      >
                        <StopCircle className="h-4 w-4" />
                        Stop
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={cancelRecording}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={sendVoiceMessage}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Voice
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ChatGPT-Style Auto-Expanding Input */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-300 rounded-3xl shadow-md focus-within:shadow-lg hover:border-gray-400 transition-all">
                <div className="flex items-end gap-2 p-2">
                  {/* Plus Button - Bottom aligned */}
                  <button
                    onClick={() => toast.info('Attach files coming soon')}
                    className="flex-shrink-0 p-2 mb-0.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors self-end"
                    title="Attach files"
                  >
                    <Plus className="h-5 w-5" />
                  </button>

                  {/* Auto-expanding Textarea - Grows upward */}
                  <textarea
                    ref={inputRef as any}
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your report..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 bg-transparent text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
                    style={{ 
                      minHeight: '36px',
                      maxHeight: '200px',
                      overflowY: 'hidden',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      lineHeight: '1.5'
                    }}
                  />
                  
                  {/* Voice Button - Bottom aligned */}
                  <button
                    onClick={startRecording}
                    disabled={isLoading}
                    className="flex-shrink-0 p-2 mb-0.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 transition-colors self-end"
                    title="Voice message"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  
                  {/* Send Button - Bottom aligned */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="flex-shrink-0 w-9 h-9 mb-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Medical Disclaimer - Aligned with textbox */}
        <div className="px-6 py-2 bg-[#F9FAFB] flex-shrink-0">
          <div className="max-w-4xl mx-auto border-t border-gray-200 pt-2">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 leading-tight">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                <strong>Disclaimer:</strong> AI responses are for informational purposes only. 
                Always consult your healthcare provider for medical advice.
              </span>
            </p>
          </div>
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

