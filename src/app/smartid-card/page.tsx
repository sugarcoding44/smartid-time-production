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
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 opacity-10"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                smartID Card Solutions
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Professional NFC smart card printing and management system for schools and institutions
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                NFC Technology
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Professional Printing
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Secure System
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3">
                <ArrowRight className="w-5 h-5 mr-2" />
                Get Complete Package - RM 4,999
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3">
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Package Components Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What's Included
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Complete smart card system with everything you need to get started
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* NFC Smart Cards */}
            <Card className="bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">NFC Smart Cards</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RM 3.50/card</p>
                  <p className="text-sm text-gray-500">Min. 100 cards</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <span>ISO 14443 compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <span>1KB memory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <span>10-year lifespan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Card Printer */}
            <Card className="bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Professional Printer</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">RM 3,999</p>
                  <p className="text-sm text-gray-500">2-year warranty</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>300 DPI resolution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>Full-color printing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>USB & Ethernet</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Software Integration */}
            <Card className="bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Software Suite</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">RM 999</p>
                  <p className="text-sm text-gray-500">One-time license</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Card designer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Database integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Batch printing</span>
                  </li>
                </ul>
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