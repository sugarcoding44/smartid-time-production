'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Smartphone, 
  Wallet,
  CreditCard,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Bell,
  TrendingUp,
  Users,
  Eye,
  Lock,
  Banknote,
  QrCode,
  UserCheck,
  Heart,
  Clock
} from 'lucide-react'

export default function SmartIDPAYPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 dark:bg-orange-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-300 dark:via-amber-300 dark:to-yellow-300 bg-clip-text text-transparent">
                    smartID PAY
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  The secure mobile e-wallet that connects students, parents, and schools. 
                  <span className="font-semibold text-amber-600 dark:text-amber-400"> Seamless payments</span> with 
                  <span className="font-semibold text-orange-600 dark:text-orange-400"> real-time monitoring</span>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Parent Oversight
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Secure Payments
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Real-time Tracking
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Download App
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-400 dark:text-amber-400 px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Right Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto" style={{width: '300px', height: '600px'}}>
                {/* Phone frame */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-[3rem] p-2 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 py-2 text-gray-900 dark:text-white text-sm">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">●●●</span>
                        <span className="text-xs">📶</span>
                        <span className="text-xs">🔋</span>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="px-4 pb-4 h-full">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between text-white">
                          <div>
                            <h3 className="text-lg font-bold">smartID PAY</h3>
                            <p className="text-white/80 text-sm">Sarah's Wallet</p>
                          </div>
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-white/70 text-sm">Available Balance</p>
                          <p className="text-2xl font-bold">RM 850.00</p>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-orange-100 dark:bg-orange-500/10 p-3 rounded-xl border border-orange-200 dark:border-orange-500/30 text-center">
                          <Banknote className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                          <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Top Up</span>
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
                          <QrCode className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Pay</span>
                        </div>
                      </div>
                      
                      {/* Recent transactions */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h4>
                        <div className="space-y-2">
                          {[
                            { icon: '🏪', text: 'Cafeteria Purchase', amount: '-RM 12.50', time: '10 mins ago' },
                            { icon: '📚', text: 'Library Fine Payment', amount: '-RM 5.00', time: '1 hour ago' },
                            { icon: '💰', text: 'Top up from Parent', amount: '+RM 200.00', time: '2 hours ago' }
                          ].map((transaction, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                                <span className="text-sm">{transaction.icon}</span>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.text}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.time}</div>
                              </div>
                              <div className={`text-sm font-bold ${transaction.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {transaction.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Secure, 
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"> Smart</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              smartID PAY connects students, parents, and schools in a secure digital ecosystem for seamless transactions and peace of mind.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* For Students */}
            <Card className="border-0 shadow-xl relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">For Students</CardTitle>
                <CardDescription className="text-lg">Easy and convenient payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Pay with palm or card at cafeteria</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Check balance anytime on mobile</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">View transaction history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Request top-ups from parents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* For Parents */}
            <Card className="border-0 shadow-xl relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 text-sm font-semibold shadow-lg">
                  🏆 MOST LOVED
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">For Parents</CardTitle>
                <CardDescription className="text-lg">Complete control and transparency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Monitor all spending in real-time</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Set spending limits and restrictions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Instant notifications for transactions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Top up remotely anytime</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* For Schools */}
            <Card className="border-0 shadow-xl relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">For Schools</CardTitle>
                <CardDescription className="text-lg">Streamlined financial operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 dark:text-gray-300">Reduce cash handling risks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 dark:text-gray-300">Automated financial reporting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 dark:text-gray-300">Integration with existing systems</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 dark:text-gray-300">Enhanced parent satisfaction</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Built for Security & Peace of Mind
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced security features and parental controls ensure safe, monitored transactions for all users.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Security Features */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Advanced Security</CardTitle>
                <CardDescription className="text-lg">Bank-grade protection for all transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">End-to-end encryption</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">Biometric authentication</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time fraud monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">Instant transaction alerts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Parental Controls */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Parental Controls</CardTitle>
                <CardDescription className="text-lg">Complete oversight and control features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Set daily/weekly spending limits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Instant transaction notifications</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Detailed spending analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Remote wallet management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Ready to Transform School Payments?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of families already using smartID PAY for safe, convenient, and transparent school transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
                <Smartphone className="w-5 h-5 mr-2" />
                Download smartID PAY
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-400 dark:text-amber-400 px-8 py-4">
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