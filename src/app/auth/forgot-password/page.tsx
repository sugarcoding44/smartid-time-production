'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSubmitted(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            If an account with that email exists, we&apos;ve sent you a password reset link.
          </p>
          <div className="pt-4">
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
