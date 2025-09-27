import React from 'react'
import { useTranslation } from '@/contexts/translation-context'


export function HowItWorksSection() {
  const { t } = useTranslation()
  
  const steps = [
    {
      number: 1,
      title: t('stepRegisterInstitution'),
      description: t('stepRegisterInstitutionDescription')
    },
    {
      number: 2,
      title: t('stepAddUsers'),
      description: t('stepAddUsersDescription')
    },
    {
      number: 3,
      title: t('stepEnrollBiometrics'),
      description: t('stepEnrollBiometricsDescription')
    },
    {
      number: 4,
      title: t('stepGoLive'),
      description: t('stepGoLiveDescription')
    }
  ]
  
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {t('howItWorksTitleNew')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('howItWorksSubtitleNew')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative p-6 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600 z-10" />
              )}
              
              <div className="relative z-20 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-full text-white text-2xl font-bold mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
