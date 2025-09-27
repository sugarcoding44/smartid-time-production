import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/contexts/translation-context'

const getEcosystemFeatures = () => [
  {
    icon: '👥',
    titleKey: 'smartIDHUB',
    subtitleKey: 'schoolManagementSystemDesc',
    descriptionKey: 'smartIDHUBDesc'
  },
  {
    icon: '🏪',
    titleKey: 'smartIDPOS',
    subtitleKey: 'cafeteriaPayments',
    descriptionKey: 'smartIDPOSDesc'
  },
  {
    icon: '💳',
    titleKey: 'smartIDPAY',
    subtitleKey: 'mobileEWalletDesc',
    descriptionKey: 'smartIDPAYDesc'
  },
  {
    icon: '🔄',
    titleKey: 'unifiedIntegration',
    subtitleKey: 'singleEcosystem',
    descriptionKey: 'unifiedIntegrationDesc'
  },
  {
    icon: '📱',
    titleKey: 'multiPaymentOptions',
    subtitleKey: 'flexibleSolutions',
    descriptionKey: 'multiPaymentOptionsDesc'
  },
  {
    icon: '📈',
    titleKey: 'hubPremiumSubscription',
    subtitleKey: 'advancedManagement',
    descriptionKey: 'hubPremiumDesc'
  }
]

export function FeaturesSection() {
  const { t } = useTranslation()
  
  return (
    <section id="features" className="py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            {t('completeEcosystem')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {t('featuresTitle')}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"></span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('featuresSubtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getEcosystemFeatures().map((feature, index) => {
            const gradients = [
              'from-blue-500 to-indigo-600',
              'from-emerald-500 to-teal-600', 
              'from-purple-500 to-pink-600',
              'from-orange-500 to-red-600',
              'from-cyan-500 to-blue-600',
              'from-violet-500 to-purple-600'
            ]
            return (
              <Card key={index} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-800/50 group-hover:to-indigo-50/30 dark:group-hover:to-indigo-950/20 transition-all duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                    <div className="text-3xl text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {(t as (key: string) => string)(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-full inline-block border border-indigo-100 dark:border-indigo-800">
                      {(t as (key: string) => string)(feature.subtitleKey)}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {(t as (key: string) => string)(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
