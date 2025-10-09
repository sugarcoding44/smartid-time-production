'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function EmailConfirmedPage() {
  const router = useRouter()
  const [showHardwareOptions, setShowHardwareOptions] = useState(false)

  useEffect(() => {
    // Show hardware options after 2 seconds
    const timer = setTimeout(() => {
      setShowHardwareOptions(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <AuthLayout
      title="Email Confirmed!"
      subtitle="Your smartID TIME account is now active"
    >
      <Card className="border-green-100 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50 p-6 text-center mb-6">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Welcome to smartID TIME!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Your email has been confirmed and your account is now active. 
          You can now access your dashboard and start managing your institution.
        </p>
        <Button 
          onClick={() => router.push('/dashboard')}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        >
          Access Dashboard
        </Button>
      </Card>

      {showHardwareOptions && (
        <div className="space-y-6 animate-fadeInUp">
          {/* Hardware Devices Section */}
          <Card className="border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Complete Your Setup with Hardware Devices
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Enhance your smartID experience with biometric devices and smart cards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🖐️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Palm & Face Scanner</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Biometric Authentication</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Palm vein recognition</li>
                  <li>• Facial recognition</li>
                  <li>• Temperature scanning</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">💳</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">smartID Cards</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">NFC Smart Cards</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Military-grade encryption</li>
                  <li>• e-Wallet functionality</li>
                  <li>• Tamper-resistant design</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Contact our sales team to order these devices for your institution
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <a href="mailto:sales@pointgate.net">
                    📧 sales@pointgate.net
                  </a>
                </Button>
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/20"
                >
                  <a href="tel:+60367340936">
                    📞 +603-6734-0936
                  </a>
                </Button>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <a href="https://wa.me/60167340936?text=Hi, I'm interested in ordering smartID hardware devices for my institution" target="_blank" rel="noopener noreferrer">
                    📱 WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* SmartPOS Integration Section */}
          <Card className="border-emerald-100 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Interested in smartID POS Integration?
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Transform your cafeteria with our complete Point of Sale system
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📱</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">smartID POS System</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Complete Cafeteria Solution</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Dual screen POS tablet</li>
                <li>• Built-in printer & NFC reader</li>
                <li>• Cloud-enabled with 4G support</li>
                <li>• Seamless integration with smartID HUB</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Get a quote for smartID POS system with professional installation
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <a href="https://wa.me/60167340936?text=Hi, I'm interested in smartID POS integration for my cafeteria" target="_blank" rel="noopener noreferrer">
                    💬 Get POS Quote via WhatsApp
                  </a>
                </Button>
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                >
                  <Link href="https://pos.smartid.my" target="_blank">
                    🌐 Visit smartID POS
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AuthLayout>
  )
}
