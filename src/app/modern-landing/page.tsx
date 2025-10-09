'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function ModernLandingPage() {

  return (
    <>
      {/* Custom Font Import - Aeonik */}
      <style jsx global>{`
        /* Eina Font Loading */
        @import url('https://fonts.cdnfonts.com/css/eina');
        
        @font-face {
          font-family: 'Eina';
          src: url('https://fonts.cdnfonts.com/s/85763/Eina01-Light.woff') format('woff');
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Eina';
          src: url('https://fonts.cdnfonts.com/s/85763/Eina01-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Eina';
          src: url('https://fonts.cdnfonts.com/s/85763/Eina01-SemiBold.woff') format('woff');
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Eina';
          src: url('https://fonts.cdnfonts.com/s/85763/Eina01-Bold.woff') format('woff');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        
        .eina-page * {
          font-family: 'Eina', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Inter', sans-serif !important;
          font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
        }
        
        .curved-bg {
          background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
          position: relative;
        }
        
        .curved-bg::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: white;
          clip-path: ellipse(100% 100% at 50% 100%);
        }
        
        .card-3d {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .dashboard-mockup {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            0 25px 50px rgba(0,0,0,0.25),
            0 10px 30px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="min-h-screen bg-white aeonik-page">
        <Header />
        
        {/* Hero Section - Finpay Style */}
        <section className="curved-bg relative overflow-hidden pt-20 pb-32">
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-48 h-48 bg-purple-200/30 rounded-full blur-2xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-800 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Trusted by 500+ Schools
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
                  Get paid early,{' '}
                  <br className="hidden md:block" />
                  save automatically{' '}
                  <br className="hidden md:block" />
                  <span className="text-blue-600">all your schools</span>.
                </h1>
                
                <p className="text-xl text-gray-600 font-light leading-relaxed max-w-xl">
                  Support schools with simple invoicing, powerful integrations, and school management tools.
                  <br className="hidden md:block" />
                  Get comprehensive education solutions.
                </p>
                
                <div className="flex items-center gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter your school email"
                    className="flex-1 max-w-sm px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-2xl shadow-xl border-0 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                  >
                    Get Started →
                  </Button>
                </div>
                
                {/* Trust Badges */}
                <div className="flex items-center gap-8 pt-8 opacity-60">
                  <span className="text-sm font-medium text-gray-500">Trusted by schools like:</span>
                  <div className="flex items-center gap-6">
                    <div className="text-lg font-bold text-gray-400">SMK Bukit Jalil</div>
                    <div className="text-lg font-bold text-gray-400">SK Taman Desa</div>
                    <div className="text-lg font-bold text-gray-400">SJK Chung Hwa</div>
                  </div>
                </div>
              </div>
              
              {/* Right Visual - Dashboard Mockup */}
              <div className="relative">
                <div className="dashboard-mockup p-6">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">SMK Bukit Jalil</div>
                        <div className="text-gray-400 text-sm">School Dashboard</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">RM1,876,580</div>
                      <div className="text-sm text-gray-400">Total Collections</div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">1,247</div>
                      <div className="text-xs text-gray-400">Active Students</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">98.5%</div>
                      <div className="text-xs text-gray-400">Attendance Rate</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">45</div>
                      <div className="text-xs text-gray-400">New This Week</div>
                    </div>
                  </div>
                  
                  {/* Payment Card Mockup */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                    <div className="relative">
                      <div className="text-sm opacity-80">SmartID Card</div>
                      <div className="text-2xl font-bold mt-2">1247 **** **** 5678</div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <div className="text-xs opacity-80">Card Holder</div>
                          <div className="font-medium">AHMAD RAHMAN</div>
                        </div>
                        <div className="text-2xl font-bold opacity-60">VISA</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">3k+ schools</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Instant Withdraw of funds</div>
                    <div className="text-lg font-bold text-gray-900">at any time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
                Everything your school needs
              </h2>
              <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
                From student management to advanced analytics, our comprehensive platform 
                streamlines every aspect of educational operations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* SmartID TIME */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1677ff] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">smartID TIME</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Complete school management system with attendance tracking, academic records, 
                  and biometric integration for seamless operations.
                </p>
              </div>

              {/* SmartID POS */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#52c41a] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">smartID POS</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Point of sale system designed for school cafeterias with inventory management, 
                  payment processing, and sales analytics.
                </p>
              </div>

              {/* SmartID PAY */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#722ed1] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">smartID PAY</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Secure mobile e-wallet for students and parents with real-time tracking, 
                  transaction history, and seamless payment integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-light text-[#1677ff] mb-4">500+</div>
                <div className="text-lg text-gray-600 font-light">Schools Nationwide</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-light text-[#1677ff] mb-4">250K+</div>
                <div className="text-lg text-gray-600 font-light">Active Users</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-light text-[#1677ff] mb-4">99.9%</div>
                <div className="text-lg text-gray-600 font-light">System Uptime</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-light text-[#1677ff] mb-4">24/7</div>
                <div className="text-lg text-gray-600 font-light">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#1677ff]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
              Ready to transform your school?
            </h2>
            <p className="text-xl text-white/90 font-light mb-12 max-w-2xl mx-auto">
              Join hundreds of schools that have already modernized their management 
              systems with SmartID's comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-[#1677ff] hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-full shadow-xl border-0"
                asChild
              >
                <Link href="/auth/signup">
                  Start Free Trial
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-light rounded-full"
                asChild
              >
                <Link href="/contact">
                  Schedule Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}