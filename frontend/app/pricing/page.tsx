'use client'

import { useRouter } from 'next/navigation'
import { Activity, Check, X, ArrowRight, Shield, Zap, Brain, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PricingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our platform',
      features: [
        { text: '5 reports per month', included: true },
        { text: 'Basic AI analysis', included: true },
        { text: 'Email support', included: true },
        { text: 'Standard processing speed', included: true },
        { text: 'Advanced AI features', included: false },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false }
      ],
      cta: 'Get Started Free',
      gradient: 'from-slate-700 via-gray-600 to-slate-600',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For individuals who need more',
      features: [
        { text: '50 reports per month', included: true },
        { text: 'Advanced AI analysis', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Fast processing speed', included: true },
        { text: 'Medical terms dictionary', included: true },
        { text: 'Chat with AI assistant', included: true },
        { text: 'Export reports (PDF)', included: true },
        { text: 'API access', included: false }
      ],
      cta: 'Start Pro Trial',
      gradient: 'from-slate-800 via-indigo-600 to-blue-600',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For organizations and clinics',
      features: [
        { text: 'Unlimited reports', included: true },
        { text: 'Advanced AI + custom models', included: true },
        { text: '24/7 phone & email support', included: true },
        { text: 'Instant processing', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true }
      ],
      cta: 'Contact Sales',
      gradient: 'from-slate-700 via-purple-600 to-violet-600',
      popular: false
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
                className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg transition-all duration-200"
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

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-semibold shadow-sm mb-6">
            <Star className="h-4 w-4 fill-current" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Choose Your </span>
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Start with our free plan and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl ${
                plan.popular
                  ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-600/20 scale-105'
                  : 'border-2 border-gray-200 shadow-lg'
              } transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{plan.period}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <X className="h-3.5 w-3.5 text-gray-400" strokeWidth={3} />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
                  className={`w-full px-6 py-4 bg-gradient-to-r ${plan.gradient} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 group`}
                >
                  {plan.cta}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              Industry-leading features for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-slate-600">Your data is encrypted and HIPAA-compliant. We never share your medical information.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-800 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Lightning Fast</h3>
              <p className="text-slate-600">Get comprehensive analysis in under 30 seconds. No waiting, instant insights.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Brain className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Expert-Level AI</h3>
              <p className="text-slate-600">Powered by GPT-4o with medical specialist knowledge and precision.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time. No questions asked, no penalties.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.'
              },
              {
                q: 'Is there a free trial for Pro plan?',
                a: 'Yes! New users get a 14-day free trial of the Pro plan. No credit card required.'
              },
              {
                q: 'How secure is my medical data?',
                a: 'Your data is encrypted end-to-end and stored on HIPAA-compliant servers. We never share your information.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Join thousands of users analyzing their medical reports with AI
          </p>
          <button
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
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

