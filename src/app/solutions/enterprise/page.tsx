import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { 
  Building2, 
  Shield, 
  Users, 
  BarChart3, 
  Lock, 
  Globe,
  CheckCircle,
  ArrowRight,
  Monitor,
  Smartphone,
  Hand,
  Database,
  Cloud,
  Zap,
  Award,
  Briefcase
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Enterprise Solutions | smartID',
  description: 'Enterprise-grade identity management, access control, and workforce solutions for large organizations',
}

export default function EnterpriseSolutionsPage() {
  const benefits = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Military-grade encryption, multi-factor authentication, and compliance with international security standards including SOC 2 and ISO 27001.'
    },
    {
      icon: Globe,
      title: 'Scalable Infrastructure',
      description: 'Cloud-native architecture that scales from hundreds to millions of users across multiple locations and time zones.'
    },
    {
      icon: Database,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics with custom dashboards, real-time insights, and predictive workforce analytics.'
    },
    {
      icon: Award,
      title: 'Compliance Ready',
      description: 'Built-in compliance features for GDPR, HIPAA, and other regulatory requirements with detailed audit trails.'
    }
  ]

  const products = [
    {
      name: 'Workforce Management',
      description: 'Complete employee lifecycle management with advanced attendance tracking and workforce analytics.',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      link: '/smartid-time',
      features: ['Employee Onboarding', 'Attendance Tracking', 'Performance Analytics', 'Compliance Reporting']
    },
    {
      name: 'Access Control System',
      description: 'Biometric access control for secure facilities with real-time monitoring and threat detection.',
      icon: Lock,
      color: 'from-purple-500 to-pink-600',
      link: '/smartid-palm',
      features: ['Biometric Authentication', 'Facility Access Control', 'Security Monitoring', 'Visitor Management']
    },
    {
      name: 'Enterprise Payment',
      description: 'Corporate payment solutions with expense management and multi-location support.',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      link: '/smartid-pay',
      features: ['Corporate Cards', 'Expense Management', 'Multi-location Support', 'Budget Controls']
    }
  ]

  const useCases = [
    {
      title: 'Large Corporations',
      description: 'Multi-national companies with complex organizational structures and high security requirements.',
      icon: Building2,
      features: ['Global Deployment', 'Multi-language Support', 'Complex Hierarchies', 'Enterprise Integration']
    },
    {
      title: 'Government Agencies',
      description: 'Public sector organizations requiring high security, compliance, and citizen service capabilities.',
      icon: Shield,
      features: ['Security Clearance Levels', 'Compliance Reporting', 'Citizen Services', 'Audit Trails']
    },
    {
      title: 'Manufacturing',
      description: 'Industrial facilities with shift workers, contractors, and strict safety and security protocols.',
      icon: Zap,
      features: ['Shift Management', 'Contractor Access', 'Safety Compliance', 'Equipment Integration']
    }
  ]

  const enterpriseFeatures = [
    {
      category: 'Security & Compliance',
      features: [
        'End-to-end encryption',
        'Multi-factor authentication',
        'SSO integration',
        'LDAP/Active Directory sync',
        'Audit logs and compliance reporting',
        'Data residency options'
      ]
    },
    {
      category: 'Scalability & Performance',
      features: [
        '99.9% uptime SLA',
        'Auto-scaling infrastructure',
        'Global CDN delivery',
        'Load balancing',
        'Disaster recovery',
        'Performance monitoring'
      ]
    },
    {
      category: 'Integration & API',
      features: [
        'RESTful APIs',
        'Webhook support',
        'Custom integrations',
        'Legacy system connectors',
        'Real-time data sync',
        'Developer documentation'
      ]
    },
    {
      category: 'Support & Services',
      features: [
        '24/7 premium support',
        'Dedicated account manager',
        'Custom implementation',
        'Training and onboarding',
        'Regular health checks',
        'Priority feature requests'
      ]
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950" style={{ fontFamily: 'Aeonik, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-600 text-sm font-medium">
                🏢 Enterprise Solutions
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Scale your
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    enterprise with
                  </span>
                  <br />
                  confidence
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  Secure, scalable digital identity solutions designed for large organizations and government agencies 
                  with complex operational requirements.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  Request Demo
                </Button>
                <Button size="lg" variant="ghost" className="text-purple-600 hover:text-purple-700 rounded-xl px-8 py-4 text-lg font-medium">
                  Speak with Expert →
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-2xl mb-6">
                    <div className="text-2xl font-bold mb-2">smartID Enterprise</div>
                    <div className="text-sm opacity-90">Security Dashboard</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          🔒
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Access Control</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Biometric Authorization</div>
                        </div>
                      </div>
                      <div className="text-purple-600 font-semibold">✓ Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          📊
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Analytics Engine</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring</div>
                        </div>
                      </div>
                      <div className="text-purple-600 font-semibold">Live</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  🎖️
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  🔍
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">500K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Users</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Countries</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">99.99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">SLA</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-2">ISO</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20 blur-xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Enterprise Requirements
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our enterprise solutions meet the most demanding security, compliance, and scalability requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Enterprise Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Integrated solutions that provide complete digital identity and workforce management capabilities.
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
              Trusted by Leading Organizations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From Fortune 500 companies to government agencies, our solutions power critical operations worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon
              return (
                <Card key={index} className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
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

      {/* Enterprise Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise-Ready Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive capabilities designed to meet the most demanding enterprise requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {enterpriseFeatures.map((category, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Enterprise-Grade Solutions?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join leading organizations worldwide who trust smartID to secure their workforce and streamline operations 
            while meeting the highest compliance standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Request Enterprise Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Speak with Solutions Expert
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
