'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Activity, Shield, Zap, FileText, ArrowRight, CheckCircle, Lock, 
  TrendingUp, Clock, Brain, Upload, BarChart3, Eye, Sparkles,
  Database, AlertTriangle, Users, Award
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('access_token')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Medical AI Analyzer
              </span>
            </div>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                AI-Powered Medical Intelligence Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Understand Your
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mt-2">
                Medical Reports Instantly
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-blue-100 leading-relaxed">
              Upload medical test reports and receive comprehensive AI analysis with severity assessments, 
              abnormal findings detection, and personalized recommendations in seconds.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
                >
                  <Upload className="h-6 w-6" />
                  Upload Report Now
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
                  >
                    <ArrowRight className="h-6 w-6" />
                    Start Free
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl hover:bg-white/20 font-bold text-xl transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-white mb-2">30s</div>
                <div className="text-sm text-blue-200">Average Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-white mb-2">99%</div>
                <div className="text-sm text-blue-200">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-white mb-2">24/7</div>
                <div className="text-sm text-blue-200">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - No White Space */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive medical analysis platform with advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Cards - Compact */}
            {[
              { icon: Brain, title: 'AI Analysis', desc: 'Advanced AI interprets your test results with medical accuracy', color: 'blue' },
              { icon: Shield, title: 'Secure Storage', desc: 'Bank-level encryption for all your medical data', color: 'green' },
              { icon: BarChart3, title: 'Trend Tracking', desc: 'Monitor health changes over time with analytics', color: 'purple' },
              { icon: AlertTriangle, title: 'Early Detection', desc: 'Identify abnormalities and critical values instantly', color: 'red' },
              { icon: FileText, title: 'PDF Support', desc: 'Upload reports in PDF or image format', color: 'orange' },
              { icon: Eye, title: 'Easy to Read', desc: 'Clear visualizations and simple explanations', color: 'indigo' },
              { icon: Database, title: 'History', desc: 'Access all past reports and analyses anytime', color: 'teal' },
              { icon: Users, title: 'Multi-User', desc: 'Manage reports for your whole family', color: 'pink' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className={`bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-snug">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Visual */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-lg text-gray-600">
              Get comprehensive medical analysis in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: 1, title: 'Upload', desc: 'Drop your medical test report (PDF/Image)', icon: Upload, color: 'blue' },
              { num: 2, title: 'AI Analyzes', desc: 'Advanced AI extracts and interprets all data', icon: Brain, color: 'green' },
              { num: 3, title: 'Get Results', desc: 'Receive detailed insights and recommendations', icon: Award, color: 'purple' }
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {step.num}
                  </div>
                  <div className={`bg-${step.color}-100 p-4 rounded-xl w-fit mb-4`}>
                    <step.icon className={`h-8 w-8 text-${step.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: CheckCircle, label: 'HIPAA Compliant', color: 'green' },
              { icon: Lock, label: 'End-to-End Encrypted', color: 'blue' },
              { icon: Brain, label: 'Advanced AI', color: 'purple' },
              { icon: Shield, label: 'Privacy First', color: 'indigo' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <item.icon className={`h-10 w-10 text-${item.color}-400 mb-3`} />
                <span className="text-sm font-semibold text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Bold */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Take Control of Your Health
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands who understand their medical reports better with AI-powered analysis
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-12 py-6 bg-white text-blue-600 rounded-2xl hover:bg-gray-50 font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
            >
              <Upload className="h-7 w-7" />
              Upload Your First Report
            </button>
          ) : (
            <button
              onClick={() => router.push('/register')}
              className="px-12 py-6 bg-white text-blue-600 rounded-2xl hover:bg-gray-50 font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
            >
              <ArrowRight className="h-7 w-7" />
              Start Analyzing Now
            </button>
          )}
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-100">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              No Credit Card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Free Forever
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Instant Results
            </span>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Medical AI Analyzer</span>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                &copy; 2025 Medical AI Analyzer. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                For informational purposes only. Not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-white\\/\\[0\\.05\\] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  )
}
