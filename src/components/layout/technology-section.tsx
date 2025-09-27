import React from 'react'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/contexts/translation-context'


export function TechnologySection() {
  const { t } = useTranslation()
  
  return (
    <section className="py-20 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('technologyBadge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {t('technologyTitleNew')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('technologySubtitleNew')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Palm Vein Detection Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl filter drop-shadow-sm">🖐️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {t('palmVeinTitle')}
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full inline-block">
                    {t('palmVeinSubtitle')}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('palmVeinDescription')}
              </p>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('keyFeaturesText')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('nonContactScanning')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('allLightingConditions')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('uniquePatterns')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('cannotBeCopied')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('highlyAccurate')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
          </Card>
          
          {/* NFC Cards Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl filter drop-shadow-sm">💳</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {t('nfcCardTitle')}
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full inline-block">
                    {t('nfcCardSubtitle')}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('nfcCardDescription')}
              </p>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('keyFeaturesText')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('advancedEncryption')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('builtInWallet')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('tamperResistant')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('cannotBeDuplicated')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('offlineTransaction')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>

        {/* Additional security info */}
        <div className="mt-16 text-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="text-3xl mb-3">🔒</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">{t('bankLevelSecurity')}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{t('bankLevelSecurityDescription')}</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="text-3xl mb-3">⚡</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">{t('instantRecognition')}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{t('instantRecognitionDescription')}</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="text-3xl mb-3">🌍</div>
                <div className="font-semibold text-gray-900 dark:text-white mb-2">{t('globalStandards')}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{t('globalStandardsDescription')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
