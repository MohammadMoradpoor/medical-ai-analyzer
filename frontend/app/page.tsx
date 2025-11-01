'use client'

import { useRouter } from 'next/navigation'
import { Activity, Upload, Brain, Zap, Shield, CheckCircle, ArrowRight, FileText, Heart, Microscope, ChevronRight, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
    setIsCheckingAuth(false)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced GPT-4o technology analyzes your medical reports with cardiologist and neurologist-level precision',
      gradient: 'from-slate-700 via-indigo-600 to-blue-600',
      shadowColor: 'shadow-indigo-600/40',
      glowColor: 'group-hover:shadow-indigo-400/60'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get comprehensive medical insights in seconds. Upload your report and receive detailed analysis immediately',
      gradient: 'from-slate-700 via-violet-600 to-purple-600',
      shadowColor: 'shadow-violet-600/40',
      glowColor: 'group-hover:shadow-violet-400/60'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and secure. HIPAA-compliant infrastructure protects your privacy',
      gradient: 'from-slate-700 via-emerald-600 to-teal-600',
      shadowColor: 'shadow-emerald-600/40',
      glowColor: 'group-hover:shadow-emerald-400/60'
    },
    {
      icon: Heart,
      title: 'Complete Coverage',
      description: 'Supports lab tests, X-rays, MRI, CT scans, ECG, EEG, and more. Comprehensive medical document analysis',
      gradient: 'from-slate-700 via-rose-600 to-pink-600',
      shadowColor: 'shadow-rose-600/40',
      glowColor: 'group-hover:shadow-rose-400/60'
    }
  ]

  const supportedTypes = [
    { icon: FileText, name: 'Lab Reports', types: 'Blood tests, urine analysis, metabolic panels' },
    { icon: Activity, name: 'Medical Imaging', types: 'X-rays, MRI, CT scans, ultrasound' },
    { icon: Heart, name: 'Cardiac Tests', types: 'ECG, EKG, stress tests, rhythm analysis' },
    { icon: Brain, name: 'Neurological', types: 'EEG, brain imaging, neurological assessments' },
    { icon: Microscope, name: 'Pathology', types: 'Tissue analysis, biopsy reports' },
    { icon: FileText, name: 'Clinical Reports', types: 'Medical examinations, clinical photographs' }
  ]

  const howItWorks = [
    { step: 1, title: 'Upload Report', description: 'Simply upload your medical report (PDF, JPG, PNG)' },
    { step: 2, title: 'AI Analysis', description: 'Our advanced AI analyzes your report in seconds' },
    { step: 3, title: 'Get Insights', description: 'Receive detailed findings, severity assessment, and recommendations' },
    { step: 4, title: 'Ask Questions', description: 'Chat with AI to understand your results better' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-300">
                <Activity className="h-7 w-7 text-white" strokeWidth={3} />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Medical AI Analyzer</h1>
                <p className="text-xs font-medium text-slate-500">AI-Powered Diagnostics</p>
              </div>
            </button>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                How It Works
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Pricing
              </button>
              <button
                onClick={() => router.push('/security')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Security
              </button>
              <button
                onClick={() => router.push('/about')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                About
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Contact
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isCheckingAuth && (
                <>
                  {isAuthenticated ? (
                    /* Authenticated User */
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    /* Not Authenticated */
                    <>
                      <button
                        onClick={() => router.push('/login')}
                        className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all duration-200 relative group"
                      >
                        Sign In
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                      </button>
                      <button
                        onClick={() => router.push('/register')}
                        className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-semibold shadow-sm">
                <Star className="h-4 w-4 fill-current" />
                World-Class Medical AI
              </div>
              
              <h1 className="text-5xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Understand Your </span>
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">Medical Reports</span>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"> Instantly</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Upload any medical report and get AI-powered analysis with detailed insights, severity assessment, and personalized recommendations in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/register')}
                    className="px-8 py-4 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Analyzing Now
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                )}
                <button
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-400 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 relative group overflow-hidden"
                >
                  <span className="relative z-10">See How It Works</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2.5 group/badge cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-700 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover/badge:scale-110 group-hover/badge:shadow-xl group-hover/badge:shadow-emerald-500/50 transition-all duration-300">
                    <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover/badge:text-emerald-600 transition-colors">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2.5 group/badge cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-700 via-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover/badge:scale-110 group-hover/badge:shadow-xl group-hover/badge:shadow-teal-500/50 transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover/badge:text-teal-600 transition-colors">Bank-Level Encryption</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-2xl border border-blue-200">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Analysis Complete</div>
                      <div className="text-xs text-gray-600">Blood Test Report</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-xs font-semibold text-gray-700">Normal Tests</span>
                      <span className="text-sm font-bold text-emerald-600">8</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-xs font-semibold text-gray-700">Abnormal</span>
                      <span className="text-sm font-bold text-red-600">2</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs font-bold text-blue-900 mb-1">AI Recommendation</div>
                      <div className="text-xs text-gray-700">Consult with your healthcare provider about elevated liver enzymes...</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl shadow-purple-500/50 animate-bounce">
                  ⚡ 30s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Powerful AI Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform complex medical reports into clear, actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all duration-300 ${
                  hoveredFeature === index 
                    ? 'transform -translate-y-2 shadow-2xl border-blue-300' 
                    : 'shadow-md'
                }`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg ${feature.shadowColor} ${
                  hoveredFeature === index ? 'scale-110 shadow-xl' : ''
                } transition-all duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get medical insights in 4 simple steps
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 relative">
              {howItWorks.map((item, index) => (
                <div 
                  key={index} 
                  className="relative group"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-blue-50/0 group-hover:from-indigo-50/50 group-hover:to-blue-50/50 transition-all duration-500"></div>
                    
                    {/* Step Number */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-2xl shadow-lg shadow-indigo-600/40 group-hover:shadow-xl group-hover:shadow-indigo-500/60 transition-all duration-300">
                      <span className="relative z-10">{item.step}</span>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <h3 className="relative text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="relative text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                  
                  {/* Arrow Connector - Cleaner Design */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 -right-3 z-10">
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-300 flex items-center justify-center shadow-md">
                        <ChevronRight className="h-4 w-4 text-indigo-600" strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supported File Types */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Comprehensive Medical Analysis
            </h2>
            <p className="text-xl text-gray-600">
              We analyze all types of medical documents and imaging
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedTypes.map((type, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-slate-50/50 border-2 border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-600/15 transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-indigo-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/50 group-hover:rotate-6 transition-all duration-300">
                    <type.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{type.name}</h3>
                    <p className="text-xs text-slate-600">{type.types}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/5"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to Understand Your Health Better?
          </h2>
          <p className="text-xl text-indigo-200 mb-8 leading-relaxed">
            Join thousands of users who trust our AI-powered medical analysis platform.
            Start analyzing your reports today - completely free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
                >
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start Free Analysis
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  Sign In to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-600/40 group-hover:scale-110 group-hover:shadow-emerald-500/60 transition-all duration-300 group-hover:rotate-6">
                <CheckCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">99.9% Uptime</h3>
              <p className="text-slate-500 group-hover:text-emerald-600 transition-colors">Always available when you need us</p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-600/40 group-hover:scale-110 group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:rotate-6">
                <Zap className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">30 Second Analysis</h3>
              <p className="text-slate-500 group-hover:text-indigo-600 transition-colors">Rapid insights without compromise</p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-600/40 group-hover:scale-110 group-hover:shadow-violet-500/60 transition-all duration-300 group-hover:rotate-6">
                <Brain className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Expert-Level AI</h3>
              <p className="text-slate-500 group-hover:text-violet-600 transition-colors">Cardiologist & neurologist precision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Medical AI Analyzer</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Advanced AI-powered medical report analysis platform. 
                Empowering patients with instant, accurate medical insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className="hover:text-white transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className="hover:text-white transition-colors">
                    Security
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button onClick={() => router.push('/about')} className="hover:text-white transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/contact')} className="hover:text-white transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/terms')} className="hover:text-white transition-colors">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © 2025 Medical AI Analyzer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
