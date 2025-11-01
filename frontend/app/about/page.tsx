'use client'

import { useRouter } from 'next/navigation'
import { Activity, Target, Users, Heart, Brain, Zap, Shield, Star, Award, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePublicNavigation } from '@/hooks/usePublicNavigation'
import { PublicLoadingBar } from '@/components/ui/PublicLoadingBar'

export default function AboutPage() {
  const router = useRouter()
  const { navigateTo, isNavigating, progress } = usePublicNavigation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const values = [
    {
      icon: Heart,
      title: 'Patient First',
      description: 'Every decision we make is centered around improving patient outcomes and experiences.',
      gradient: 'from-slate-700 via-rose-600 to-pink-600'
    },
    {
      icon: Brain,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to make medical insights accessible to everyone.',
      gradient: 'from-slate-800 via-indigo-600 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your privacy and data security are non-negotiable. We maintain the highest standards.',
      gradient: 'from-slate-700 via-emerald-600 to-teal-600'
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Healthcare insights should be understandable and available to all, not just medical professionals.',
      gradient: 'from-slate-700 via-violet-600 to-purple-600'
    }
  ]

  const team = [
    {
      role: 'Leadership',
      description: 'Experienced healthcare and AI experts leading the mission'
    },
    {
      role: 'Engineering',
      description: 'World-class developers building secure, scalable systems'
    },
    {
      role: 'Medical Advisors',
      description: 'Board-certified physicians ensuring accuracy and safety'
    },
    {
      role: 'Support',
      description: 'Dedicated team helping users understand their health'
    }
  ]

  const milestones = [
    { year: '2023', title: 'Founded', description: 'Medical AI Analyzer launched with mission to democratize healthcare insights' },
    { year: '2024', title: '10K Users', description: 'Reached 10,000 active users analyzing their medical reports' },
    { year: '2024', title: 'HIPAA Certified', description: 'Achieved HIPAA compliance and SOC 2 certification' },
    { year: '2025', title: 'AI Upgrade', description: 'Integrated GPT-4o for even more accurate medical analysis' }
  ]

  const stats = [
    { icon: Users, value: '50K+', label: 'Active Users' },
    { icon: Activity, value: '500K+', label: 'Reports Analyzed' },
    { icon: Award, value: '99.9%', label: 'Uptime' },
    { icon: TrendingUp, value: '4.9/5', label: 'User Rating' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigateTo('/')} className="flex items-center gap-3 group">
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
                onClick={() => navigateTo('/#features')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Features
              </button>
              <button
                onClick={() => navigateTo('/#how-it-works')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                How It Works
              </button>
              <button
                onClick={() => navigateTo('/pricing')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Pricing
              </button>
              <button
                onClick={() => navigateTo('/security')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Security
              </button>
              <button
                onClick={() => navigateTo('/about')}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg transition-all duration-200"
              >
                About
              </button>
              <button
                onClick={() => navigateTo('/contact')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigateTo('/login')}
                    className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigateTo('/register')}
                    className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Loading Bar */}
      <PublicLoadingBar progress={progress} isNavigating={isNavigating} />

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-semibold shadow-sm mb-6">
            <Star className="h-4 w-4 fill-current" />
            Our Mission
          </div>
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Empowering </span>
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Patients</span>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"> Worldwide</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize medical insights through AI, making healthcare 
            more accessible, understandable, and empowering for everyone.
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-4">
                  Medical reports are often complex, filled with jargon, and difficult to understand. 
                  We believe that everyone deserves to understand their own health data without needing 
                  a medical degree.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  By combining cutting-edge AI technology with medical expertise, we transform complicated 
                  medical reports into clear, actionable insights—empowering patients to have informed 
                  conversations with their healthcare providers and take control of their health journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <value.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Making a difference in healthcare accessibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-600/40 group-hover:scale-110 group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:rotate-6">
                  <stat.icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to democratize healthcare
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="relative pl-8 pb-8 border-l-4 border-indigo-200 last:border-l-0 last:pb-0"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold rounded-full">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{milestone.title}</h3>
                    </div>
                    <p className="text-slate-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate experts dedicated to improving healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((group, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 text-center mb-2">{group.role}</h3>
                <p className="text-sm text-slate-600 text-center">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Be part of the healthcare revolution. Start understanding your medical reports today.
          </p>
          <button
            onClick={() => navigateTo(isAuthenticated ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
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
              <p className="text-gray-400 text-sm">
                Advanced AI-powered medical report analysis platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => navigateTo('/')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => navigateTo('/')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => navigateTo('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigateTo('/security')} className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => navigateTo('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigateTo('/contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => navigateTo('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigateTo('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
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

