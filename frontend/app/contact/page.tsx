'use client'

import { useRouter } from 'next/navigation'
import { Activity, Mail, MessageCircle, Phone, MapPin, Clock, Send, Star, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ContactPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email anytime',
      contact: 'support@medicalai.com',
      gradient: 'from-slate-800 via-indigo-600 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 24/7',
      gradient: 'from-slate-700 via-violet-600 to-purple-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak to our team',
      contact: '+1 (555) 123-4567',
      gradient: 'from-slate-700 via-emerald-600 to-teal-600'
    }
  ]

  const officeInfo = [
    {
      icon: MapPin,
      title: 'Headquarters',
      info: '123 Medical Plaza, San Francisco, CA 94102'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      info: 'Monday - Friday: 9:00 AM - 6:00 PM PST'
    },
    {
      icon: Mail,
      title: 'General Inquiries',
      info: 'info@medicalai.com'
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

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-semibold shadow-sm mb-6">
            <MessageCircle className="h-4 w-4" />
            We're Here to Help
          </div>
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Get in </span>
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Our team is always ready to help.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-8 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-300 group hover:-translate-y-1 text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${method.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <method.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{method.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{method.description}</p>
                <p className="text-indigo-600 font-semibold">{method.contact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-600 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                  <p className="text-emerald-700 font-medium">Thank you! Your message has been sent successfully.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-slate-800 via-indigo-600 to-blue-600 hover:from-slate-700 hover:via-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Office Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Office Information</h2>
                
                <div className="space-y-6">
                  {officeInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{info.title}</h3>
                        <p className="text-slate-600">{info.info}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Response Time */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Response Time</h3>
                    <p className="text-slate-700 leading-relaxed">
                      We typically respond to all inquiries within 24 hours during business days. 
                      For urgent matters, please use our live chat or call us directly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Support for Users */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Already a User?</h3>
                    <p className="text-slate-700 mb-4">
                      Access faster support through your dashboard's help center.
                    </p>
                    <button
                      onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Looking for Quick Answers?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Check out these resources before reaching out
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-4 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <h3 className="font-bold text-slate-900 mb-1">Features</h3>
              <p className="text-sm text-slate-600">Learn about our capabilities</p>
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-4 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <h3 className="font-bold text-slate-900 mb-1">Pricing</h3>
              <p className="text-sm text-slate-600">View plans and pricing</p>
            </button>
            <button
              onClick={() => router.push('/security')}
              className="px-6 py-4 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
            >
              <h3 className="font-bold text-slate-900 mb-1">Security</h3>
              <p className="text-sm text-slate-600">Learn about data protection</p>
            </button>
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

