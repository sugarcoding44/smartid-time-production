'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Star, 
  ArrowRight,
  PlayCircle,
  Sparkles,
  Printer,
  Clock,
  Wifi,
  Users,
  Phone,
  Lock,
  Smartphone,
  Monitor,
  Zap,
  Download,
  NfcIcon
} from 'lucide-react'

export default function SmartIDCardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-300 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                    smartID Card
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Complete NFC smart card ecosystem with 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> professional card printing</span> and 
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400"> secure payment integration</span>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Shield className="w-4 h-4 mr-2" />
                  NFC Technology
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Professional Printing
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <Lock className="w-4 h-4 mr-2" />
                  Bank-Grade Security
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-600 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Order Complete Package - RM 4,999
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-blue-200/30 dark:border-blue-600/30 shadow-2xl overflow-hidden p-8">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                    <CreditCard className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">NFC Smart Cards</h3>
                    <p className="text-gray-600 dark:text-gray-300">Tap for instant transactions</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">13.56MHz</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">NFC Frequency</div>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">4cm</div>
                      <div className="text-xs text-indigo-700 dark:text-indigo-300">Read Distance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Components Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Card
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent"> Package</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need for a complete smart card system - from professional printing to secure payment processing.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* NFC Smart Cards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">NFC Smart Cards</CardTitle>
                <CardDescription className="text-lg">High-quality RFID cards with NFC chip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>ISO 14443 Type A compliant</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>1KB EEPROM memory</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>10-year lifespan guarantee</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>Water & scratch resistant</span>
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">RM 3.50/card</p>
                  <p className="text-sm text-gray-500">Minimum order: 100 cards</p>
                </div>
              </CardContent>
            </Card>

            {/* Card Printer */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Printer className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Professional Printer</CardTitle>
                <CardDescription className="text-lg">High-resolution ID card printer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    <span>300 DPI print resolution</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    <span>Full-color dye sublimation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    <span>200-card input hopper</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    <span>USB & Ethernet connectivity</span>
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RM 3,999</p>
                  <p className="text-sm text-gray-500">Includes 2-year warranty</p>
                </div>
              </CardContent>
            </Card>

            {/* Software Integration */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Software Suite</CardTitle>
                <CardDescription className="text-lg">Card design & management software</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    <span>Drag-and-drop card designer</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    <span>Database integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    <span>Batch printing capability</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    <span>Template library included</span>
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">RM 999</p>
                  <p className="text-sm text-gray-500">One-time license fee</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Card
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent"> Features</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Payment & Transactions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment & Transactions</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Secure contactless payments for cafeterias, bookstores, and other school services with real-time balance tracking.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Instant NFC tap payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Real-time balance updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Transaction history tracking</span>
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Control</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Secure building access, library entry, and restricted area control with role-based permissions.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>Multi-zone access control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>Time-based permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>Audit trail logging</span>
                </li>
              </ul>
            </div>

            {/* Attendance Tracking */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-200/50 dark:border-cyan-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Automated attendance recording for classes, events, and activities with instant parent notifications.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  <span>Quick tap check-in/out</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  <span>Automated parent SMS alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  <span>Digital attendance reports</span>
                </li>
              </ul>
            </div>

            {/* Student Identification */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student Identification</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Professional student ID cards with photos, emergency contacts, and digital integration capabilities.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>High-quality photo printing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Emergency contact details</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>QR code integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Technical 
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent"> Specifications</span>
            </h2>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">NFC Smart Card Specs</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Card Type</span>
                    <span className="text-gray-900 dark:text-white font-medium">ISO 14443 Type A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chip</span>
                    <span className="text-gray-900 dark:text-white font-medium">MIFARE Classic 1K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Operating Frequency</span>
                    <span className="text-gray-900 dark:text-white font-medium">13.56 MHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Read Distance</span>
                    <span className="text-gray-900 dark:text-white font-medium">Up to 4cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data Storage</span>
                    <span className="text-gray-900 dark:text-white font-medium">1024 bytes EEPROM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Card Dimensions</span>
                    <span className="text-gray-900 dark:text-white font-medium">85.6 × 54 × 0.76mm</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Printer Specifications</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Print Technology</span>
                    <span className="text-gray-900 dark:text-white font-medium">Dye Sublimation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Print Resolution</span>
                    <span className="text-gray-900 dark:text-white font-medium">300 DPI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Print Speed</span>
                    <span className="text-gray-900 dark:text-white font-medium">150 cards/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Card Capacity</span>
                    <span className="text-gray-900 dark:text-white font-medium">200 cards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connectivity</span>
                    <span className="text-gray-900 dark:text-white font-medium">USB 2.0, Ethernet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Operating System</span>
                    <span className="text-gray-900 dark:text-white font-medium">Windows 10/11</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Ready for Smart Cards?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transform your institution with professional smart card solutions. Complete package includes cards, printer, and software.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-600 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg">
                <Phone className="w-5 h-5 mr-2" />
                Order Complete Package - RM 4,999
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 px-8 py-4 text-lg">
                <ArrowRight className="w-5 h-5 mr-2" />
                Contact Sales Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}