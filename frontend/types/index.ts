export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface MedicalReport {
  id: string
  file_name: string
  report_type?: string
  test_date?: string
  upload_date: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  severity_level?: 'normal' | 'attention_needed' | 'urgent' | 'critical'
  is_critical: boolean
  file_size?: number
  analysis_completed_at?: string
  processing_duration?: number  // Duration in seconds
}

export interface ReportAnalysis {
  report_id: string
  status: string
  severity_level?: string
  is_critical: boolean
  has_abnormalities: boolean
  summary?: string
  abnormal_findings?: AbnormalFinding[]
  recommendations?: string[]
  test_results?: TestResult[]
  test_analysis?: TestResult[]
  extracted_data?: any  // Raw extracted data from document
}

export interface AbnormalFinding {
  finding: string
  severity: string
  explanation: string
  action_needed: string
}

export interface TestResult {
  test_name: string
  value: string
  reference_range: string
  is_normal: boolean
  severity: string
  interpretation?: string
  clinical_significance?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_type?: string
  confidence_score?: number
  sources?: string[]
  follow_up_suggestions?: string[]
  medical_terms_explained?: Record<string, string>
  tokens_used?: number
  cost_estimate?: number
  is_helpful?: boolean
  user_rating?: number
  conversation_id?: string
  created_at: string
}

export interface SuggestedQuestions {
  questions: string[]
}

export interface ChatStats {
  total_messages: number
  user_questions: number
  ai_responses: number
  conversations_count: number
  total_tokens_used: number
  total_cost_usd: number
  average_confidence?: number
  last_message_at?: string
}

