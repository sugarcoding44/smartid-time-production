import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { 
  Store, 
  CreditCard, 
  BarChart3, 
  Clock, 
  Shield, 
  Smartphone,
  CheckCircle,
  ArrowRight,
  Monitor,
  Hand,
  Coffee,
  ShoppingBag,
  Users,
  Zap
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Retail & F&B Solutions | smartID',
  description: 'Modern POS systems and payment solutions for restaurants, cafes, and retail stores',
}

export default function RetailSolutionsPage() {
  const benefits = [
    {
      icon: Zap,
      title: 'Lightning-Fast Transactions',
      description: 'Process payments quickly with contactless cards, mobile wallets, and biometric authentication to reduce queue times.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Sales Analytics',
      description: 'Track sales performance, inventory levels, and customer preferences with comprehensive reporting dashboards.'
    },
    {
      icon: Shield,
      title: 'Secure Payment Processing',
      description: 'Military-grade encryption and secure payment processing ensure customer data protection and compliance.'
    },
    {
      icon: Users,
      title: 'Enhanced Customer Experience',
      description: 'Offer seamless checkout experiences with multiple payment options and personalized service capabilities.'
    }
  ]

  const products = [
    {
      name: 'smartID POS',
      description: 'All-in-one point-of-sale system with built-in printer, card reader, and cloud connectivity.',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600',
      link: '/smartid-pos',
      features: ['Cloud-based POS', 'Built-in Printer', 'NFC Card Reader', 'Multi-store Support']
    },
    {
      name: 'Payment Processing',
      description: 'Accept all major payment methods including contactless cards, mobile wallets, and biometric payments.',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      link: '/smartid-pay',
      features: ['Contactless Payments', 'Mobile Wallets', 'Biometric Auth', 'Real-time Processing']
    },
    {
      name: 'Smart Cards & Readers',
      description: 'Custom loyalty cards and biometric scanners for secure customer identification and rewards.',
      icon: Hand,
      color: 'from-purple-500 to-pink-600',
      link: '/smartid-card',
      features: ['Custom Loyalty Cards', 'Biometric Scanners', 'Reward Programs', 'Customer Identification']
    }
  ]

  const useCases = [
    {
      title: 'Restaurants & Cafes',
      description: 'Streamline dining experiences with table ordering, kitchen integration, and split billing capabilities.',
      icon: Coffee,
      features: ['Table Management', 'Kitchen Display', 'Split Billing', 'Menu Management']
    },
    {
      title: 'Retail Stores',
      description: 'Comprehensive inventory management with barcode scanning and multi-location support.',
      icon: ShoppingBag,
      features: ['Inventory Tracking', 'Barcode Scanning', 'Multi-location', 'Customer Database']
    },
    {
      title: 'Quick Service Food',
      description: 'Fast-paced ordering systems with queue management and loyalty program integration.',
      icon: Zap,
      features: ['Quick Ordering', 'Queue Management', 'Loyalty Integration', 'Mobile Ordering']
    }
  ]

  const features = [
    'Cloud-based system with offline capability',
    'Real-time inventory management',
    'Comprehensive sales reporting',
    'Multi-payment method support',
    'Customer loyalty programs',
    'Staff management and permissions',
    'Multi-store and franchise support',
    '24/7 customer support'
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950" style={{ fontFamily: 'Aeonik, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 text-sm font-medium">
                🏪 Retail & F&B Solutions
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Make your
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    business thrive
                  </span>
                  <br />
                  effortlessly
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  Transform your restaurant, cafe, or retail store with smart POS solutions that your customers 
                  and staff will love using every day.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="ghost" className="text-emerald-600 hover:text-emerald-700 rounded-xl px-8 py-4 text-lg font-medium">
                  Book Demo →
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl mb-6">
                    <div className="text-2xl font-bold mb-2">smartID POS</div>
                    <div className="text-sm opacity-90">Restaurant Terminal</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          🍽️
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Table 5 Order</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">2x Nasi Lemak, 1x Teh Tarik</div>
                        </div>
                      </div>
                      <div className="text-emerald-600 font-semibold">$18.50</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          🖐️
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Payment Method</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Palm ID Authentication</div>
                        </div>
                      </div>
                      <div className="text-emerald-600 font-semibold">✓ Ready</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  💳
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  📊
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Businesses</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">$50M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Processed</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">99.8%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Uptime</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-2">30s</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Setup</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 text-sm font-medium mb-6">
              ✨ Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Built for modern
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> commerce</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Our retail and F&B solutions handle the fast-paced demands of modern business with ease and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    ⚡ Lightning-Fast Transactions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Process payments quickly with contactless cards, mobile wallets, and biometric authentication to reduce queue times.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mt-4">
                    💳 Multiple payment methods
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    📊 Real-time Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Track sales performance, inventory levels, and customer preferences with comprehensive reporting dashboards.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium mt-4">
                    📈 Data-driven insights
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    🔒 Secure Processing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Military-grade encryption and secure payment processing ensure customer data protection and compliance.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium mt-4">
                    🎖️ Enterprise-grade security
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-3xl p-8 border border-orange-100 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    ❤️ Enhanced Experience
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Offer seamless checkout experiences with multiple payment options and personalized service capabilities.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mt-4">
                    🚀 Customer-first approach
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Business Technology Stack
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to run a modern retail or F&B business, integrated and ready to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const IconComponent = product.icon
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${product.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {product.description}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={product.link}>Learn More</Link>
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect for Every Business Type
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Whether you run a restaurant, retail store, or service business, we have solutions tailored for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon
              return (
                <Card key={index} className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {useCase.description}
                  </p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Our comprehensive platform includes all the tools modern businesses need to thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of businesses already using smartID to increase sales, improve efficiency, and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
