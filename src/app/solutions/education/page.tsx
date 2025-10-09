import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { 
  GraduationCap, 
  Users, 
  Clock, 
  CreditCard, 
  Shield, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Monitor,
  Smartphone,
  Hand,
  Building,
  Star,
  Zap,
  Heart,
  Sparkles
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Education Solutions | smartID',
  description: 'Transform your school with digital attendance, cashless payments, and comprehensive management systems',
}

export default function EducationSolutionsPage() {
  const benefits = [
    {
      icon: '🎯',
      title: 'Smart Attendance',
      description: 'Effortless biometric attendance that students and teachers love using',
      highlight: 'Save 2+ hours daily'
    },
    {
      icon: '💳',
      title: 'Cashless Campus',
      description: 'Safe, contactless payments your students are already familiar with',
      highlight: '100% secure transactions'
    },
    {
      icon: '📊',
      title: 'Real-time Insights',
      description: 'Instant visibility into campus operations and student engagement',
      highlight: 'Data-driven decisions'
    }
  ]

  const products = [
    {
      name: 'smartID TIME',
      description: 'Complete school management system with attendance tracking, leave management, and analytics.',
      icon: Monitor,
      color: 'from-blue-500 to-indigo-600',
      link: '/smartid-time',
      features: ['Biometric Attendance', 'Student Records', 'Parent Portal', 'Analytics Dashboard']
    },
    {
      name: 'smartID POS',
      description: 'Modern point-of-sale system for canteens, bookstores, and campus retail outlets.',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600',
      link: '/smartid-pos',
      features: ['Cashless Payments', 'Inventory Management', 'Sales Reports', 'Multi-outlet Support']
    },
    {
      name: 'Biometric Scanner',
      description: 'Palm vein and facial recognition technology for secure, contactless identification.',
      icon: Hand,
      color: 'from-purple-500 to-pink-600',
      link: '/smartid-palm',
      features: ['Palm Vein Recognition', 'Face Detection', 'Temperature Screening', 'Contactless Operation']
    }
  ]

  const useCases = [
    {
      title: 'Primary & Secondary Schools',
      description: 'Comprehensive student management with parent engagement features and safety monitoring.',
      features: ['Student Attendance', 'Parent Notifications', 'Canteen Payments', 'Library Access']
    },
    {
      title: 'Universities & Colleges',
      description: 'Advanced campus management for higher education with multi-campus support.',
      features: ['Course Attendance', 'Exam Management', 'Campus Services', 'Student Analytics']
    },
    {
      title: 'International Schools',
      description: 'Multi-language support with international standards compliance and reporting.',
      features: ['Multi-language Interface', 'International Standards', 'Advanced Reporting', 'Global Compliance']
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950" style={{ fontFamily: 'Aeonik, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-sm font-medium">
                🎓 Education Solutions
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Make campus
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    management feel
                  </span>
                  <br />
                  like home
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  Offer digital solutions your students and staff are familiar with, whether they're on campus or remote. 
                  Our technology creates seamless experiences everyone loves.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  Contact Us
                </Button>
                <Button size="lg" variant="ghost" className="text-blue-600 hover:text-blue-700 rounded-xl px-8 py-4 text-lg font-medium">
                  View Docs →
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl mb-6">
                    <div className="text-2xl font-bold mb-2">smartID</div>
                    <div className="text-sm opacity-90">Accepted here</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Attendance</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Biometric Check-in</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold">✓ Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          💳
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Canteen Payment</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Scan to pay</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold">$12.50</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  📊
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  🔒
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Trusted by educational
              <br />institutions worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of schools creating better experiences with technology students and staff love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-600 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-6">{benefit.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                    {benefit.description}
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {benefit.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Schools Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1M+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to create amazing
                <br />campus experiences?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Start your digital transformation journey with solutions designed for education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started Today
                </Button>
                <Button size="lg" variant="ghost" className="text-white border-2 border-white/30 hover:bg-white/10 rounded-xl px-8 py-4 text-lg font-semibold">
                  Schedule Demo →
                </Button>
              </div>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
