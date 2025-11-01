'use client'

import { useRouter } from 'next/navigation'
import { Activity, Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PrivacyPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        {
          subtitle: '1.1 Personal Information',
          text: 'We collect information that you provide directly to us, including your name, email address, password, and any other information you choose to provide when creating an account or using our services.'
        },
        {
          subtitle: '1.2 Medical Reports',
          text: 'When you upload medical reports for analysis, we collect and process the content of these reports. This includes medical test results, diagnostic images, and related health information.'
        },
        {
          subtitle: '1.3 Usage Information',
          text: 'We automatically collect information about how you interact with our services, including your IP address, browser type, device information, pages visited, and time spent on our platform.'
        }
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: '2.1 Service Provision',
          text: 'We use your information to provide, maintain, and improve our medical report analysis services, including processing your medical documents and generating AI-powered insights.'
        },
        {
          subtitle: '2.2 Communication',
          text: 'We may use your contact information to send you service-related notifications, updates, security alerts, and respond to your inquiries.'
        },
        {
          subtitle: '2.3 Platform Improvement',
          text: 'We analyze aggregated, anonymized usage data to improve our AI models, enhance user experience, and develop new features.'
        },
        {
          subtitle: '2.4 Legal Compliance',
          text: 'We process your information as necessary to comply with applicable laws, regulations, and legal processes.'
        }
      ]
    },
    {
      title: '3. Data Protection & Security',
      content: [
        {
          subtitle: '3.1 Encryption',
          text: 'All data is encrypted using industry-standard AES-256 encryption both in transit (using TLS 1.3) and at rest. Your medical information is protected with bank-level security.'
        },
        {
          subtitle: '3.2 Access Controls',
          text: 'We implement strict access controls and authentication measures. Only authorized personnel with a legitimate business need can access user data, and all access is logged and monitored.'
        },
        {
          subtitle: '3.3 HIPAA Compliance',
          text: 'Our platform is HIPAA compliant. We maintain comprehensive security measures, conduct regular audits, and follow industry best practices for handling protected health information (PHI).'
        },
        {
          subtitle: '3.4 Data Retention',
          text: 'We retain your personal information for as long as your account is active or as needed to provide services. Medical reports are retained according to HIPAA requirements and can be deleted upon request.'
        }
      ]
    },
    {
      title: '4. Information Sharing',
      content: [
        {
          subtitle: '4.1 No Sale of Data',
          text: 'We do not sell, rent, or trade your personal information or medical data to third parties for marketing purposes. Your health information is yours alone.'
        },
        {
          subtitle: '4.2 Service Providers',
          text: 'We may share information with trusted service providers who assist us in operating our platform (e.g., cloud hosting, payment processing). These providers are contractually bound to protect your information and use it only for specified purposes.'
        },
        {
          subtitle: '4.3 Legal Requirements',
          text: 'We may disclose information if required by law, court order, or governmental request, or to protect our rights, safety, or property.'
        },
        {
          subtitle: '4.4 Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you of any such change and choices you may have.'
        }
      ]
    },
    {
      title: '5. Your Rights & Choices',
      content: [
        {
          subtitle: '5.1 Access & Correction',
          text: 'You have the right to access, update, or correct your personal information at any time through your account settings.'
        },
        {
          subtitle: '5.2 Data Deletion',
          text: 'You may request deletion of your account and associated data. We will delete your information within 30 days, except where retention is required by law.'
        },
        {
          subtitle: '5.3 Data Portability',
          text: 'You have the right to receive a copy of your data in a portable format and to transfer it to another service.'
        },
        {
          subtitle: '5.4 Opt-Out',
          text: 'You can opt out of non-essential communications at any time through your account settings or by contacting us.'
        }
      ]
    },
    {
      title: '6. Cookies & Tracking',
      content: [
        {
          subtitle: '6.1 Essential Cookies',
          text: 'We use essential cookies necessary for the operation of our platform, including authentication and security features.'
        },
        {
          subtitle: '6.2 Analytics',
          text: 'We use analytics tools to understand how users interact with our service. This helps us improve functionality and user experience. You can opt out of analytics tracking.'
        },
        {
          subtitle: '6.3 Your Control',
          text: 'Most browsers allow you to control cookies through settings. Disabling certain cookies may limit functionality of our service.'
        }
      ]
    },
    {
      title: '7. International Data Transfers',
      content: [
        {
          subtitle: '',
          text: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy and applicable laws, including GDPR where applicable.'
        }
      ]
    },
    {
      title: '8. Children\'s Privacy',
      content: [
        {
          subtitle: '',
          text: 'Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.'
        }
      ]
    },
    {
      title: '9. Changes to This Policy',
      content: [
        {
          subtitle: '',
          text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Continued use of our services after changes constitutes acceptance of the updated policy.'
        }
      ]
    },
    {
      title: '10. Contact Us',
      content: [
        {
          subtitle: '',
          text: 'If you have questions about this Privacy Policy or our data practices, please contact us at:\n\nEmail: privacy@medicalai.com\nAddress: 123 Medical Plaza, San Francisco, CA 94102\nPhone: +1 (555) 123-4567'
        }
      ]
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
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Medical AI Analyzer</h1>
                <p className="text-xs font-medium text-slate-500">AI-Powered Diagnostics</p>
              </div>
            </button>

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
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-5 py-2.5 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-slate-600 mt-1">Last Updated: January 2025</p>
            </div>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            At Medical AI Analyzer, your privacy is our priority. This Privacy Policy explains how we collect, 
            use, protect, and handle your personal information and medical data.
          </p>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Key Privacy Highlights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Data Encryption', description: 'AES-256 encryption' },
              { icon: Shield, title: 'HIPAA Compliant', description: 'Certified & audited' },
              { icon: Eye, title: 'No Data Selling', description: 'Your data stays private' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  {section.title}
                </h2>
                
                <div className="space-y-6 pl-11">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      {item.subtitle && (
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{item.subtitle}</h3>
                      )}
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Consent */}
          <div className="mt-16 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your Consent</h3>
                <p className="text-slate-700 leading-relaxed">
                  By using Medical AI Analyzer, you consent to this Privacy Policy and our collection and use of 
                  information as described. If you do not agree with this policy, please do not use our services.
                </p>
              </div>
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

