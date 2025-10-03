'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Hand, 
  Zap, 
  CheckCircle, 
  Star, 
  ArrowRight,
  PlayCircle,
  Sparkles,
  Shield,
  Clock,
  Fingerprint,
  Wifi,
  Users,
  Phone,
  Lock,
  Smartphone,
  Monitor,
  CreditCard,
  Download
} from 'lucide-react'

export default function SmartIDPalmPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Hand className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent">
                    smartID Palm
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Revolutionary contactless biometric palm recognition technology with 
                  <span className="font-semibold text-purple-600 dark:text-purple-400"> 99.9% accuracy</span> and 
                  <span className="font-semibold text-pink-600 dark:text-pink-400"> lightning-fast recognition</span>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Contactless Technology
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  99.9% Accuracy
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Military Grade Security
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Order smartID Palm - RM 2,499
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-purple-200/30 dark:border-purple-600/30 shadow-2xl overflow-hidden p-8">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                    <Hand className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Palm Recognition</h3>
                    <p className="text-gray-600 dark:text-gray-300">Scan your palm 10cm away</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">&lt;1s</div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">Recognition Time</div>
                    </div>
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">99.9%</div>
                      <div className="text-xs text-pink-700 dark:text-pink-300">Accuracy Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Perfect for Every
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"> Use Case</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Attendance Tracking */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Perfect for schools and institutions to track student and staff attendance with zero contact.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Contactless check-in/check-out</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Real-time attendance reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Parent notifications</span>
                </li>
              </ul>
            </div>

            {/* Payment Processing */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Processing</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Secure and fast payment processing for cafeterias, bookstores, and other school services.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Instant palm payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Secure transaction processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Balance management</span>
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Control</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Control access to restricted areas, labs, libraries, and administrative offices.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Secure area access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Time-based permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Access logs and reports</span>
                </li>
              </ul>
            </div>

            {/* Health & Safety */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health & Safety</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Promote hygiene and safety with completely contactless biometric authentication.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Zero contact required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Hygienic solution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Works in all conditions</span>
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
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"> Specifications</span>
            </h2>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 dark:border-purple-700/50 shadow-lg max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Device Specifications</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recognition Method</span>
                    <span className="text-gray-900 dark:text-white font-medium">Palm Vein Pattern</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Scanning Distance</span>
                    <span className="text-gray-900 dark:text-white font-medium">5-15cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recognition Time</span>
                    <span className="text-gray-900 dark:text-white font-medium">&lt;1 second</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Rate</span>
                    <span className="text-gray-900 dark:text-white font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">False Reject Rate</span>
                    <span className="text-gray-900 dark:text-white font-medium">&lt;0.01%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Operating Temperature</span>
                    <span className="text-gray-900 dark:text-white font-medium">0°C to 45°C</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Connectivity & Support</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connection</span>
                    <span className="text-gray-900 dark:text-white font-medium">Ethernet, WiFi, USB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Power Supply</span>
                    <span className="text-gray-900 dark:text-white font-medium">DC 12V / PoE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database Capacity</span>
                    <span className="text-gray-900 dark:text-white font-medium">50,000+ users</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Warranty</span>
                    <span className="text-gray-900 dark:text-white font-medium">2 Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Certification</span>
                    <span className="text-gray-900 dark:text-white font-medium">CE, FCC, RoHS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Dimensions</span>
                    <span className="text-gray-900 dark:text-white font-medium">180×120×40mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Hand className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Ready to Experience the Future?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transform your institution with smartID Palm biometric technology. Contact us for a demo and pricing.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg">
                <Phone className="w-5 h-5 mr-2" />
                Order smartID Palm - RM 2,499
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 px-8 py-4 text-lg">
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