import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/translation-context'

const keyBenefits = [
  {
    icon: '🚀',
    title: 'Quick Setup',
    description: 'Get your school up and running with smartID in minutes. Simple registration and intuitive onboarding.',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    description: 'Bank-level security with 99.9% uptime. Your data is encrypted and protected with advanced security.',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Parents and students can access everything from mobile apps. Real-time notifications and updates.',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    icon: '💡',
    title: 'Smart Integration',
    description: 'All systems work together seamlessly. One login, complete ecosystem, unified experience.',
    gradient: 'from-orange-500 to-red-600'
  }
]

const workflowSteps = [
  {
    step: '1',
    title: 'Start with smartID TIME',
    description: 'Register your school and enroll students with biometric data (Free to start)',
    color: 'blue',
    link: '/smartid-time',
    cta: 'Start Free'
  },
  {
    step: '2', 
    title: 'Add smartID POS (Optional)',
    description: 'Start free 7-day trial, then choose your plan. Optionally purchase POS hardware for canteens.',
    color: 'emerald',
    link: '/smartid-pos',
    cta: 'Start Free Trial'
  },
  {
    step: '3',
    title: 'Enable smartID PAY',
    description: 'Parents download the app to top up and monitor student spending',
    color: 'amber',
    link: '/smartid-pay',
    cta: 'Get App'
  }
]

export function SimpleFeaturesSection() {
  const { t } = useTranslation()
  
  return (
    <section id="features" className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Why Choose smartID */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Why Choose smartID TIME
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Everything You Need in
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">One Platform</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Stop juggling multiple systems. smartID TIME provides a complete, integrated solution for modern schools.
          </p>
        </div>
        
        {/* Key Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {keyBenefits.map((benefit, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white text-lg">{benefit.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get your school running on smartID TIME in three simple steps
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {workflowSteps.map((step, index) => {
            const colorClasses = {
              blue: {
                gradient: 'from-blue-500 to-indigo-600',
                bg: 'bg-blue-50 dark:bg-blue-950/20',
                text: 'text-blue-600 dark:text-blue-400',
                button: 'bg-blue-500 hover:bg-blue-600'
              },
              emerald: {
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50 dark:bg-emerald-950/20',
                text: 'text-emerald-600 dark:text-emerald-400',
                button: 'bg-emerald-500 hover:bg-emerald-600'
              },
              amber: {
                gradient: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-50 dark:bg-amber-950/20',
                text: 'text-amber-600 dark:text-amber-400',
                button: 'bg-amber-500 hover:bg-amber-600'
              }
            }
            const colors = colorClasses[step.color as keyof typeof colorClasses]
            
            return (
              <Card key={index} className="relative text-center hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-xl font-bold">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{step.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{step.description}</p>
                  
                  <Button asChild size="sm" className={`${colors.button} text-white shadow-sm hover:shadow-md transition-all duration-200`}>
                    <Link href={step.link}>{step.cta}</Link>
                  </Button>
                </CardContent>
                
                {/* Arrow connector (except for last item) */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 dark:border-l-gray-500 border-y-2 border-y-transparent"></div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}