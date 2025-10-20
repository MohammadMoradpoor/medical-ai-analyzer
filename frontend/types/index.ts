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

