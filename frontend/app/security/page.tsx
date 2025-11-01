'use client'

import { useRouter } from 'next/navigation'
import { Activity, Shield, Lock, Eye, Server, Key, CheckCircle, FileCheck, AlertTriangle, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SecurityPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption, both in transit and at rest. Your medical information is protected at every step.',
      gradient: 'from-slate-700 via-emerald-600 to-teal-600'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Our platform meets all HIPAA requirements for handling protected health information (PHI). Regular audits ensure continued compliance.',
      gradient: 'from-slate-800 via-indigo-600 to-blue-600'
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'We never sell or share your data. Your medical information is yours alone. Anonymous analytics only, with your explicit consent.',
      gradient: 'from-slate-700 via-violet-600 to-purple-600'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Hosted on enterprise-grade AWS infrastructure with 99.99% uptime SLA. Redundant backups and disaster recovery protocols.',
      gradient: 'from-slate-700 via-blue-600 to-cyan-600'
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Multi-factor authentication (MFA) available. Role-based access control ensures only authorized personnel can access systems.',
      gradient: 'from-slate-700 via-rose-600 to-pink-600'
    },
    {
      icon: FileCheck,
      title: 'Audit Logs',
      description: 'Comprehensive audit trails track all data access and modifications. Real-time monitoring detects suspicious activity.',
      gradient: 'from-slate-700 via-amber-600 to-orange-600'
    }
  ]

  const certifications = [
    { name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
    { name: 'SOC 2 Type II', description: 'Service Organization Control' },
    { name: 'ISO 27001', description: 'Information Security Management' },
    { name: 'GDPR', description: 'General Data Protection Regulation' }
  ]

  const securityPractices = [
    {
      title: 'Regular Security Audits',
      description: 'Third-party penetration testing and vulnerability assessments conducted quarterly.'
    },
    {
      title: 'Data Minimization',
      description: 'We only collect and retain the minimum data necessary for service functionality.'
    },
    {
      title: 'Secure Development',
      description: 'Code reviews, automated security testing, and secure SDLC practices.'
    },
    {
      title: 'Employee Training',
      description: 'All staff undergo regular security awareness and HIPAA training.'
    },
    {
      title: 'Incident Response',
      description: '24/7 security monitoring with established incident response protocols.'
    },
    {
      title: 'Data Retention',
      description: 'Clear data retention policies with secure deletion when no longer needed.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Features
              </button>
              <button
                onClick={() => router.push('/')}
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
                className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg transition-all duration-200"
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

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
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

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-semibold shadow-sm mb-6">
            <Shield className="h-4 w-4" />
            Enterprise-Grade Security
          </div>
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Your Data is </span>
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Protected</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We implement industry-leading security measures to protect your sensitive medical information. 
            Your privacy and data security are our top priorities.
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Comprehensive Security Features
            </h2>
            <p className="text-xl text-gray-600">
              Multiple layers of protection for your medical data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Industry Certifications
            </h2>
            <p className="text-xl text-gray-600">
              Certified and audited by independent third parties
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-emerald-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cert.name}</h3>
                <p className="text-sm text-slate-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Practices */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Security Best Practices
            </h2>
            <p className="text-xl text-gray-600">
              Our commitment to maintaining the highest security standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPractices.map((practice, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{practice.title}</h3>
                </div>
                <p className="text-slate-600 ml-9">{practice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Statement */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Our Security Commitment</h3>
                <p className="text-emerald-100 leading-relaxed mb-4">
                  Security is not just a feature—it's the foundation of our platform. We understand the sensitive 
                  nature of medical data and have built our infrastructure with security at its core.
                </p>
                <p className="text-emerald-100 leading-relaxed mb-4">
                  Every line of code, every system design decision, and every operational procedure is evaluated 
                  through the lens of security and privacy. We undergo regular third-party audits and maintain 
                  compliance with international healthcare data protection standards.
                </p>
                <p className="text-emerald-100 leading-relaxed">
                  If you have any security concerns or questions, our security team is available 24/7 at{' '}
                  <a href="mailto:security@medicalai.com" className="font-bold text-white hover:text-emerald-300 transition-colors">
                    security@medicalai.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Disclosure */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Security Vulnerability Disclosure</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We value the security community and welcome responsible disclosure of potential security vulnerabilities.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you believe you've found a security issue in our platform, please email us at{' '}
                  <a href="mailto:security@medicalai.com" className="font-bold text-indigo-600 hover:text-indigo-700">
                    security@medicalai.com
                  </a>
                  {' '}with details of the vulnerability. We aim to respond within 24 hours and will keep you updated on our progress.
                </p>
                <div className="bg-white border border-amber-300 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Please include:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li>Detailed description of the vulnerability</li>
                    <li>Steps to reproduce the issue</li>
                    <li>Potential impact assessment</li>
                    <li>Any proof-of-concept code (if applicable)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Your Data is Safe With Us
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Start analyzing your medical reports with confidence
          </p>
          <button
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
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
                <li><button onClick={() => router.push('/')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => router.push('/')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => router.push('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => router.push('/security')} className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => router.push('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => router.push('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
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

