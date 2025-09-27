'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const sendTestEmail = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to send test email')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-50">
              📧 Email Configuration Test
            </CardTitle>
            <p className="text-slate-400">
              Test your SMTP configuration for SmartID Hub email functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter email to test (e.g., your-email@example.com)"
              />
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-slate-300 font-medium mb-2">Current SMTP Settings:</h3>
              <div className="text-sm text-slate-400 space-y-1">
                <p>📮 Server: smtp.gmail.com:587</p>
                <p>👤 From: no-reply@pointgate.net</p>
                <p>🔒 Security: STARTTLS</p>
              </div>
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Test Email...</span>
                </div>
              ) : (
                'Send Test Email'
              )}
            </Button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            {result && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg">
                <h3 className="font-medium mb-2">✅ Test Email Sent Successfully!</h3>
                <div className="text-sm space-y-1">
                  <p>📧 Sent to: {email}</p>
                  <p>🆔 Message ID: {result.messageId}</p>
                  <p>📝 Subject: [TEST] Welcome to SmartID Hub - Set up your account</p>
                </div>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-slate-300 font-medium mb-2">📋 Next Steps:</h3>
              <div className="text-sm text-slate-400 space-y-1">
                <p>1. ✅ Configure SMTP settings (Already done!)</p>
                <p>2. 🗃️ Run database migration in Supabase</p>
                <p>3. 👥 Test user creation with email</p>
                <p>4. 🔐 Test password setup flow</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg">
              <h3 className="font-medium mb-2">⚠️ Database Setup Required</h3>
              <p className="text-sm">
                Before testing user creation, run the SQL migration in Supabase:
              </p>
              <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Copy contents from: <code className="bg-slate-800 px-1 rounded">setup_email_tables.sql</code></li>
                <li>Click "Run" to execute</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
