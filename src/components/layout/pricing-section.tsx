import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useTranslation } from '@/contexts/translation-context'

const pricingTiers = [
  {
    name: 'smartID HUB',
    subtitle: 'School Management System',
    price: 'Free',
    premiumMonthly: 'RM99',
    premiumYearly: 'RM70',
    yearlyNote: 'per month, billed yearly',
    description: 'Complete school & user management, biometric enrollment, attendance and leave management system.',
    features: [
      '✅ FREE: User registration & management',
      '✅ FREE: smartID card enrollment registration',
      '✅ FREE: Palm ID enrollment registration', 
      '✅ FREE: Basic analytics dashboard',
      '✅ FREE: Mobile app access',
      '✅ FREE: Basic monitoring & webapp dashboard',
      '🔥 PREMIUM: Advanced time attendance tracking',
      '🔥 PREMIUM: Leave management system',
      '🔥 PREMIUM: Advanced analytics & reporting',
      '🔥 PREMIUM: School management tools',
      '🔥 PREMIUM: Priority support'
    ],
    buttonText: 'Start Free',
    buttonVariant: 'default' as const,
    popular: true,
    gradient: 'from-blue-50 to-indigo-100',
    link: '/auth/signup',
    hasSecondButton: true,
    secondButtonText: 'Get Premium',
    secondButtonLink: '/upgrade'
  },
  {
    name: 'smartID POS',
    subtitle: 'Point of Sale System',
    price: 'Contact',
    period: 'Hardware + Setup',
    description: 'Complete POS system with dual screen, built-in printer and NFC card reader',
    features: [
      'Cloud-enabled POS system',
      'Sales report analytics',
      'Seamless withdrawal system',
      'Easy setup & configuration',
      'Multiple payment modes',
      'Dual screen display',
      'Built-in printer & NFC reader',
      'Works without internet (4G)',
      'Battery operated',
      'Hardware included'
    ],
    buttonText: 'CONTACT US',
    buttonVariant: 'default' as const,
    popular: false,
    gradient: 'from-emerald-50 to-teal-100',
    link: 'https://pos.smartid.my'
  },
  {
    name: 'smartID PAY',
    subtitle: 'Mobile e-Wallet App',
    price: 'Free',
    period: 'Download',
    description: 'Mobile app for e-wallet management, payments, and balance monitoring',
    features: [
      'e-Wallet management',
      'Mobile payments',
      'Balance monitoring',
      'Transfer capabilities',
      'Spending controls',
      'Parent monitoring',
      'Available on iOS & Android'
    ],
    buttonText: 'Download PAY',
    buttonVariant: 'outline' as const,
    popular: false,
    gradient: 'from-purple-50 to-pink-100',
    link: '#download-app',
    hasDownloadButtons: true,
    googlePlayLink: 'https://play.google.com/store/apps',
    appStoreLink: 'https://apps.apple.com/app'
  }
]

export function PricingSection() {
  const { t } = useTranslation()
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {t('smartIDSuiteComponents')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {t('pricingDescription')}
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isYearly ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('yearly')}
              <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                {t('save29')}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm ${
                tier.popular 
                  ? 'border-2 border-indigo-500/50 dark:border-indigo-400/50 shadow-xl bg-white/90 dark:bg-gray-800/90' 
                  : 'border border-gray-200/50 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 hover:bg-white/95 dark:hover:bg-gray-800/95'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center py-3 text-sm font-semibold">
                  <div className="relative">
                    <span className="relative z-10">🌟 Most Popular</span>
                    <div className="absolute inset-0 bg-white/20 blur-sm"></div>
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center pb-8 ${tier.popular ? 'pt-16' : 'pt-8'}`}>
                <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${
                  tier.name.includes('Registry') 
                    ? 'from-blue-500 via-indigo-600 to-purple-600' 
                    : tier.name.includes('POS') 
                    ? 'from-emerald-500 via-green-600 to-teal-600' 
                    : 'from-purple-500 via-indigo-600 to-blue-600'
                } rounded-3xl flex items-center justify-center mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className="text-4xl filter drop-shadow-sm">
                    {tier.name.includes('Registry') ? '👥' : 
                     tier.name.includes('POS') ? '🏪' : '⏰'}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-4 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full inline-block">
                  {tier.subtitle}
                </p>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    {tier.price}
                  </div>
                  {tier.premiumMonthly && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Premium: {isYearly ? tier.premiumYearly : tier.premiumMonthly}/month
                      {isYearly && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          ({tier.yearlyNote})
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {tier.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.hasSecondButton ? (
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      variant="default"
                      size="lg"
                    >
                      <Link href={tier.link || '/auth/signup'}>
                        {tier.buttonText}
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                      variant="default"
                      size="lg"
                    >
                      <Link href={tier.secondButtonLink || '/upgrade'}>
                        {tier.secondButtonText || 'Upgrade'}
                      </Link>
                    </Button>
                  </div>
                ) : tier.hasDownloadButtons ? (
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      variant="default"
                      size="lg"
                    >
                      <Link href={tier.googlePlayLink || '#'} className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        Google Play
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      variant="default"
                      size="lg"
                    >
                      <Link href={tier.appStoreLink || '#'} className="flex items-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                        </svg>
                        App Store
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    className={`w-full ${
                      tier.buttonVariant === 'default' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                        : tier.buttonVariant === 'outline'
                        ? 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-400 dark:hover:text-gray-900'
                        : ''
                    }`}
                    variant={tier.buttonVariant}
                    size="lg"
                  >
                    <Link href={tier.link || '/auth/signup'}>
                      {tier.buttonText}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-500">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
              🚀 Complete Ecosystem Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
                <div className="text-4xl mb-3 filter drop-shadow-sm">🔄</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">Seamless Integration</div>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed">One registration works across all systems</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm">
                <div className="text-4xl mb-3 filter drop-shadow-sm">📁</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">Unified Analytics</div>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed">Combined reporting across all platforms</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
                <div className="text-4xl mb-3 filter drop-shadow-sm">💰</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">Cost Effective</div>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed">Start free and scale as you grow</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
