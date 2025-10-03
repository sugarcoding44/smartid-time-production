'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  CreditCard, 
  Printer, 
  ShoppingCart, 
  BarChart3,
  CheckCircle,
  Star,
  Download,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Package,
  Shield,
  Zap,
  Users,
  ArrowRight,
  PlayCircle,
  Sparkles
} from 'lucide-react'

export default function SmartIDPOSPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 dark:bg-teal-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-300 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                    smartID POS
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Professional Point of Sale software with <span className="font-semibold text-emerald-600 dark:text-emerald-400">7-day free trial</span> - 
                  Complete POS solution with subscription plans designed for every business size.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                7 Days Free Trial
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                No Credit Card Required
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Unlimited Users & Devices
              </Badge>
            </div>
            
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4" asChild>
                  <Link href="http://localhost:3002/pos/register">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-400 dark:text-emerald-400 px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Right Tablet Mockup */}
            <div className="relative">
              <div className="relative mx-auto" style={{width: '500px', height: '380px'}}>
                {/* Tablet frame */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-[2.5rem] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden relative transition-colors duration-300">
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 py-2 text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                      <span className="font-medium">smartID POS</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">12:34</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="px-4 py-3 h-full">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between text-white">
                          <div>
                            <h3 className="text-base font-bold">Today's Sales</h3>
                            <p className="text-white/80 text-xs">Cafeteria Operations</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">RM 2,450</div>
                            <div className="text-xs text-white/80">156 orders</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu items grid */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { name: 'Chicken Rice', price: 'RM 6.50', emoji: '🍚', selected: false },
                          { name: 'Nasi Lemak', price: 'RM 5.00', emoji: '🍛', selected: true },
                          { name: 'Milo Ice', price: 'RM 2.50', emoji: '🥤', selected: true },
                          { name: 'Roti Canai', price: 'RM 2.00', emoji: '🥖', selected: false }
                        ].map((item, idx) => (
                          <div key={idx} className={`relative p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                            item.selected 
                              ? 'border-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-emerald-400/50'
                          }`}>
                            <div className="text-center">
                              <div className="text-lg mb-1">{item.emoji}</div>
                              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</div>
                              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.price}</div>
                            </div>
                            {item.selected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Cart summary */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Current Order</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">#SF2024-1247</span>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>1x Nasi Lemak</span>
                            <span className="text-gray-900 dark:text-white font-medium">RM 5.00</span>
                          </div>
                          <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>1x Milo Ice</span>
                            <span className="text-gray-900 dark:text-white font-medium">RM 2.50</span>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">Total:</span>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">RM 7.50</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 hover:from-emerald-600 hover:to-green-700 transition-all duration-200">
                          🖐️ Pay with Palm ID
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Subscription Plans */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Software Subscription
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Start Your
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent"> Free Trial </span>
              Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Try SmartID POS software for 7 days completely free. No credit card required. Choose your plan when you're ready.
            </p>
            
            {/* Monthly/Yearly Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isAnnual
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                      isAnnual
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Trial - Featured */}
            <Card className="border-0 shadow-xl relative scale-105 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-2 border-emerald-200 dark:border-emerald-700">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 text-sm font-semibold shadow-lg">
                  🎉 7 DAYS FREE
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">Free Trial</CardTitle>
                <CardDescription className="text-lg">Try everything for 7 days</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">FREE</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">7 days • No credit card</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                    <span>Full POS functionality</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                    <span>Unlimited devices & staff</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                    <span>Menu management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                    <span>Sales reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                    <span>No transaction fees</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg text-lg py-3" asChild>
                  <Link href="http://localhost:3002/pos/register">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription className="text-lg">Perfect for small businesses</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    RM {isAnnual ? '80' : '100'}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    per {isAnnual ? 'month (billed yearly)' : 'month'} + {isAnnual ? '0.8%' : '1%'} per transaction
                  </p>
                  {isAnnual && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Save RM 240/year + lower fees!
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Basic POS features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Unlimited devices & staff</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Menu management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Sales reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Email support</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" asChild>
                    <Link href="http://localhost:3002/pos/register">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start with Starter
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">7-day free trial included</p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription className="text-lg">For growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    RM {isAnnual ? '160' : '200'}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    per {isAnnual ? 'month (billed yearly)' : 'month'} + {isAnnual ? '0.4%' : '0.5%'} per transaction
                  </p>
                  {isAnnual && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Save RM 480/year + lower fees!
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>All Starter features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Inventory management</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-400 dark:text-purple-400" asChild>
                    <Link href="http://localhost:3002/pos/register">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start with Pro
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">7-day free trial included</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Register:</strong> Sign up and start your 7-day free trial</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Try Everything:</strong> Full access to all features for 7 days</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Choose Plan:</strong> Select Starter or Professional when ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Options */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Hardware Options
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Use your existing device or upgrade to our professional smartID POS Terminal for the complete experience
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Software Option */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Android App</CardTitle>
                <CardDescription className="text-lg">Use your existing Android tablet or phone</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">FREE</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Download from Play Store</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Full POS functionality</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Cloud synchronization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Multi-device support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Basic support</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Free
                </Button>
              </CardContent>
            </Card>

            {/* Hardware Option - Featured */}
            <Card className="border-0 shadow-xl relative scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-700">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 text-sm font-semibold">
                  ⭐ MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">smartID POS Terminal</CardTitle>
                <CardDescription className="text-lg">Professional POS device manufactured by smartID</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">RM 1,899</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">One-time purchase</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>10.1" professional display</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Built-in thermal printer</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>smartID Palm & Card reader</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>2-year warranty</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Free installation & setup</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg py-3">
                  <Phone className="w-5 h-5 mr-2" />
                  Order from smartID
                </Button>
              </CardContent>
            </Card>

            {/* Complete Solution */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Complete Setup</CardTitle>
                <CardDescription className="text-lg">Hardware + installation + training + support</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">RM 2,299</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Everything you need</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>smartID POS Terminal included</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>On-site installation & setup</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Staff training (2-hour session)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>3-month priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    <span>Business consultation</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-400 dark:text-purple-400">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Sales Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}