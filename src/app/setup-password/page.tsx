'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserInfo {
  id: string
  full_name: string
  employee_id: string
  email: string
  primary_role: string
}

export default function SetupPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setError('No setup token provided')
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/setup-password?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setUserInfo(data.user)
      } else {
        setError(data.error || 'Invalid token')
      }
    } catch (error) {
      setError('Failed to verify token')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setSubmitting(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to set password')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse animation-delay-200"></div>
              <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse animation-delay-400"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-50">Password Set Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-400 mb-4">
              Your password has been set successfully!
            </p>
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-indigo-400 font-medium mb-2 flex items-center gap-2">
                📱 Next Steps: Download Mobile App
              </h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Download the SmartID Hub Mobile App</p>
                <p>• Login with: <strong>{userInfo?.email}</strong></p>
                <p>• Use the password you just created</p>
                <p>• Access attendance, e-wallet, and more!</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm mb-4">
              <strong>Note:</strong> These credentials are for the mobile app only. Web admin access is managed separately.
            </div>
            <Button
              onClick={() => window.close()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-50">Setup Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <p className="text-slate-400 text-sm">
              Please contact your system administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-50">Set Up Your Password</CardTitle>
          <p className="text-slate-400">Welcome to SmartID Hub</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {userInfo && (
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-slate-50 font-medium">{userInfo.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="text-slate-50 font-medium">{userInfo.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-50 font-medium">{userInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="text-slate-50 font-medium capitalize">{userInfo.primary_role}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={8}
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting Password...</span>
                </div>
              ) : (
                'Set Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
