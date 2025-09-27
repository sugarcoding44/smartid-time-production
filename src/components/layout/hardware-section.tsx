import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useTranslation } from '@/contexts/translation-context'

const hardwareDevices = [
  {
    category: 'User Identification Device',
    devices: [
      {
        name: 'Palm & Face Scanner',
        subtitle: 'Biometric Identification • Attendance Management • Biometric Wallet Integration',
        image: '/images/hardware/palm-scanner.png',
        imageAlt: 'Palm vein and facial recognition device',
        hasRealImage: true,
        price: 'Contact Sales',
        features: [
          'Register users with biometric identification',
          'Pay for items on smartID POS with biometric ID',
          'Track attendance with biometric ID',
          'Temperature scanning for health monitoring',
          'Works in various lighting conditions',
          'Hygienic contactless operation',
          'Wall mount bracket included'
        ],
        specs: [
          'Palm Vein + Face Recognition',
          'Temperature Detection',
          'Detection Speed: <1 sec',
          'Multiple mounting options'
        ],
        gradient: 'from-blue-500 to-indigo-600'
      }
    ]
  },
  {
    category: 'Point of Sale System',
    devices: [
      {
        name: 'smartID POS',
        subtitle: 'All-in-One POS Tablet',
        image: '/images/pos/smartpos-tablet.png',
        imageAlt: 'smartID POS dual screen tablet with built-in printer',
        hasRealImage: true,
        price: 'Contact Sales',
        features: [
          'Cloud-enabled POS system',
          'Dual screen display',
          'Built-in thermal printer',
          'NFC card reader',
          'Battery operated',
          '4G SIM ready'
        ],
        specs: [
          'Dual Screen Display',
          'Built-in Printer',
          'NFC Card Reader',
          'Battery + 4G Support'
        ],
        gradient: 'from-emerald-500 to-teal-600'
      }
    ]
  },
  {
    category: 'Smart Cards & Technology',
    devices: [
      {
        name: 'smartID Cards',
        subtitle: 'Encrypted Payment Cards',
        image: '/images/hardware/id-cards.png',
        imageAlt: 'smartID NFC cards for students, teachers, and staff',
        hasRealImage: true,
        price: 'Contact Sales',
        features: [
          'Military-grade encryption',
          'Built-in e-wallet functionality',
          'Dual frequency support',
          'Tamper-resistant design',
          'Cannot be duplicated',
          'Works with all SmartPOS devices'
        ],
        specs: [
          'NFC + RFID Compatible',
          'Advanced Encryption',
          'e-Wallet Storage',
          'Tamper-Proof Design'
        ],
        gradient: 'from-purple-500 to-pink-600'
      },
      {
        name: 'Palm Vein Technology',
        subtitle: 'Contactless Biometric System',
        image: '🖐️',
        hasRealImage: false,
        price: 'Integrated Solution',
        features: [
          'Near-infrared vein pattern detection',
          'Impossible to replicate or forge',
          'Hygienic contactless scanning',
          'Works in all lighting conditions',
          'Highly accurate identification',
          'Lifetime unique patterns'
        ],
        specs: [
          'Vein Pattern Recognition',
          '99.9% Accuracy Rate',
          'Contactless Operation',
          'Universal Compatibility'
        ],
        gradient: 'from-orange-500 to-red-600'
      }
    ]
  }
]


export function HardwareSection() {
  const { t } = useTranslation()
  
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hardware & Devices</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {t('hardwareTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('hardwareSubtitle')}
          </p>
        </div>

        {hardwareDevices.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {category.category}
            </h3>
            <div className="space-y-12">
              {category.devices.map((device, index) => (
                <Card key={index} className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Content Section */}
                      <div className="space-y-6">
                        {/* Device Header */}
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            {!device.hasRealImage && (
                              <div className={`w-16 h-16 bg-gradient-to-br ${device.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                                <span className="text-3xl filter drop-shadow-sm">{device.image}</span>
                              </div>
                            )}
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{device.name}</h4>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full inline-block">
                                {device.subtitle}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{device.price}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">{t('keyFeatures')}</h5>
                          <ul className="space-y-3">
                            {device.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start">
                                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Specifications */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('specifications')}</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {device.specs.map((spec, specIndex) => (
                              <div key={specIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                • {spec}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contact Button */}
                        <div>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3">
                            {t('contactSales')}
                          </Button>
                        </div>
                      </div>

                      {/* Image Section */}
                      {device.hasRealImage && (
                        <div className="flex justify-center lg:justify-end">
                          <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 shadow-inner">
                            <Image
                              src={device.image}
                              alt={device.imageAlt || device.name}
                              fill
                              className="object-contain p-4"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decorative gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${device.gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>
                </Card>
              ))}
            </div>
          </div>
        ))}


        {/* Contact Information */}
        <div className="mt-16 text-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('deployHardware')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('deployHardwareDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                📧 sales@pointgate.net
              </Button>
              <Button size="lg" variant="outline">
                📞 +603-67340936
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
