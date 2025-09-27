'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { CheckCircle, Crown, Users, ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  return (
    <AuthLayout
      title="Welcome to SmartID Hub!"
      subtitle="Your institution has been successfully set up"
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🎉 Setup Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your institution has been registered and your admin account is ready to use.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">What's been set up for you:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-200">Institution profile created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-200">Admin account activated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-200">User management ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-200">Premium features enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Next Steps:</h4>
          <ul className="text-sm text-amber-800 dark:text-amber-200 text-left space-y-1">
            <li>• Set up your institution's work groups</li>
            <li>• Add users (teachers, staff, students)</li>
            <li>• Configure attendance settings</li>
            <li>• Explore premium features like leave management</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue to Dashboard
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Automatically redirecting in {countdown} seconds...
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help getting started? Check our{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Quick Start Guide
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
