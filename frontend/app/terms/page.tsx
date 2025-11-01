'use client'

import { useRouter } from 'next/navigation'
import { Activity, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LoadingBar } from '@/components/ui/LoadingBar'

export default function TermsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Medical AI Analyzer ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service. We reserve the right to update these Terms at any time, and your continued use constitutes acceptance of any modifications.'
    },
    {
      title: '2. Description of Service',
      content: 'Medical AI Analyzer provides AI-powered analysis of medical reports, including but not limited to lab results, medical imaging, and diagnostic documents. Our Service uses advanced artificial intelligence to provide insights, explanations, and recommendations based on your uploaded medical data. This Service is intended for informational purposes only and does not replace professional medical advice.'
    },
    {
      title: '3. Medical Disclaimer',
      subsections: [
        {
          title: '3.1 Not Medical Advice',
          content: 'THE SERVICE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read through our Service.'
        },
        {
          title: '3.2 Emergency Situations',
          content: 'If you think you may have a medical emergency, call your doctor, go to the emergency room, or call emergency services immediately. Medical AI Analyzer is not designed for use in medical emergencies.'
        },
        {
          title: '3.3 AI Limitations',
          content: 'While we strive for accuracy, AI analysis may contain errors or inaccuracies. Our Service should be used as a supplementary tool to help you understand your medical reports, not as a definitive medical assessment.'
        }
      ]
    },
    {
      title: '4. User Accounts',
      subsections: [
        {
          title: '4.1 Account Creation',
          content: 'To use our Service, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
        },
        {
          title: '4.2 Age Requirement',
          content: 'You must be at least 18 years old to use this Service. By creating an account, you represent that you meet this age requirement.'
        },
        {
          title: '4.3 Account Security',
          content: 'You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account credentials.'
        },
        {
          title: '4.4 Account Termination',
          content: 'We reserve the right to suspend or terminate your account at any time for violation of these Terms, suspected fraud, or any other reason at our sole discretion.'
        }
      ]
    },
    {
      title: '5. Acceptable Use',
      subsections: [
        {
          title: '5.1 Permitted Use',
          content: 'You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that could damage, disable, overburden, or impair our servers or networks.'
        },
        {
          title: '5.2 Prohibited Activities',
          content: 'You agree NOT to: (a) upload false, misleading, or fraudulent medical reports; (b) attempt to gain unauthorized access to our systems; (c) use automated systems to access the Service without permission; (d) interfere with or disrupt the Service; (e) upload malicious code or viruses; (f) violate any applicable laws or regulations.'
        },
        {
          title: '5.3 Content Ownership',
          content: 'You retain all rights to your medical reports and data. By uploading content to our Service, you grant us a limited license to process, analyze, and display that content as necessary to provide the Service to you.'
        }
      ]
    },
    {
      title: '6. Intellectual Property',
      subsections: [
        {
          title: '6.1 Our IP',
          content: 'All content, features, and functionality of the Service, including but not limited to text, graphics, logos, software, and AI models, are owned by Medical AI Analyzer and are protected by copyright, trademark, and other intellectual property laws.'
        },
        {
          title: '6.2 Limited License',
          content: 'We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of our Service without written permission.'
        },
        {
          title: '6.3 Feedback',
          content: 'If you provide us with feedback or suggestions, we may use them without any obligation to compensate you. You grant us all rights to use such feedback for any purpose.'
        }
      ]
    },
    {
      title: '7. Payment & Subscriptions',
      subsections: [
        {
          title: '7.1 Fees',
          content: 'Certain features of our Service require payment. By subscribing to a paid plan, you agree to pay all applicable fees as described in our pricing page. All fees are non-refundable except as required by law.'
        },
        {
          title: '7.2 Billing',
          content: 'You authorize us to charge your payment method on a recurring basis according to your selected subscription plan. Subscription fees will be billed automatically until you cancel.'
        },
        {
          title: '7.3 Cancellation',
          content: 'You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. No refunds will be provided for partial months or unused services.'
        },
        {
          title: '7.4 Price Changes',
          content: 'We reserve the right to change our pricing at any time. We will provide advance notice of price changes, and you will have the opportunity to cancel before the new price takes effect.'
        }
      ]
    },
    {
      title: '8. Privacy & Data Protection',
      content: 'Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your personal and medical information in accordance with HIPAA and other applicable privacy laws. Please review our Privacy Policy to understand our data practices.'
    },
    {
      title: '9. Disclaimers',
      subsections: [
        {
          title: '9.1 "As Is" Service',
          content: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.'
        },
        {
          title: '9.2 Accuracy Disclaimer',
          content: 'While we strive to provide accurate AI analysis, we do not guarantee the accuracy, completeness, or reliability of any information provided through the Service. Medical information is complex and AI analysis may contain errors.'
        },
        {
          title: '9.3 Availability',
          content: 'We do not guarantee that the Service will be available at all times or error-free. We may experience hardware, software, or other problems that cause interruptions or delays.'
        }
      ]
    },
    {
      title: '10. Limitation of Liability',
      content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEDICAL AI ANALYZER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM: (a) YOUR USE OR INABILITY TO USE THE SERVICE; (b) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS OR YOUR PERSONAL INFORMATION; (c) ANY ERRORS OR OMISSIONS IN THE CONTENT OR AI ANALYSIS; (d) ANY MEDICAL DECISIONS MADE BASED ON THE SERVICE. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE PAST TWELVE MONTHS.'
    },
    {
      title: '11. Indemnification',
      content: 'You agree to indemnify, defend, and hold harmless Medical AI Analyzer, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; (d) any medical decisions or actions you take based on the Service.'
    },
    {
      title: '12. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in San Francisco County, California.'
    },
    {
      title: '13. Dispute Resolution',
      subsections: [
        {
          title: '13.1 Informal Resolution',
          content: 'Before filing a claim, you agree to try to resolve the dispute informally by contacting us at legal@medicalai.com. We will attempt to resolve the dispute informally for at least 60 days.'
        },
        {
          title: '13.2 Arbitration',
          content: 'If we cannot resolve a dispute informally, any dispute arising from these Terms will be resolved through binding arbitration in accordance with the American Arbitration Association rules, rather than in court.'
        },
        {
          title: '13.3 Class Action Waiver',
          content: 'You agree to resolve disputes with us on an individual basis only, and not as part of any class, consolidated, or representative action.'
        }
      ]
    },
    {
      title: '14. Modifications to Service',
      content: 'We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.'
    },
    {
      title: '15. Severability',
      content: 'If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.'
    },
    {
      title: '16. Entire Agreement',
      content: 'These Terms, together with our Privacy Policy, constitute the entire agreement between you and Medical AI Analyzer regarding the Service and supersede all prior agreements and understandings.'
    },
    {
      title: '17. Contact Information',
      content: 'For questions about these Terms of Service, please contact us at:\n\nEmail: legal@medicalai.com\nAddress: 123 Medical Plaza, San Francisco, CA 94102\nPhone: +1 (555) 123-4567'
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
                onClick={() => router.push('/#features')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Features
              </button>
              <button
                onClick={() => router.push('/#how-it-works')}
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

      {/* Loading Bar */}
      <LoadingBar />

      {/* Header */}
      <div className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-slate-600 mt-1">Last Updated: January 2025</p>
            </div>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Please read these Terms of Service carefully before using Medical AI Analyzer. 
            By using our Service, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="py-12 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Important Medical Disclaimer</h2>
              <p className="text-slate-700 leading-relaxed">
                Medical AI Analyzer is an informational tool only and does not provide medical advice. 
                Always consult with qualified healthcare professionals regarding your health. In case of 
                medical emergency, contact emergency services immediately.
              </p>
            </div>
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
                
                <div className="pl-11">
                  {section.content && (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line mb-6">{section.content}</p>
                  )}
                  
                  {section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((subsection, idx) => (
                        <div key={idx}>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{subsection.title}</h3>
                          <p className="text-slate-700 leading-relaxed">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Acceptance */}
          <div className="mt-16 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Acceptance of Terms</h3>
                <p className="text-slate-700 leading-relaxed">
                  By using Medical AI Analyzer, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms of Service. If you do not agree, please discontinue use of our Service immediately.
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

