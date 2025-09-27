'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Check, Crown, Loader2, Users } from 'lucide-react'

interface InstitutionRegisterFormProps {
  onToggleForm?: () => void
}

export function InstitutionRegisterForm({ onToggleForm }: InstitutionRegisterFormProps) {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionCode: '',
    institutionType: '',
    // Admin information
    adminName: '',
    adminEmail: '',
    adminIcNumber: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'free' as 'free' | 'premium'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.institutionName || !formData.adminName || !formData.adminEmail || !formData.adminIcNumber || !formData.adminPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Call the API route for institution registration
      const response = await fetch('/api/auth/register-institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          institutionName: formData.institutionName,
          institutionCode: formData.institutionCode,
          institutionType: formData.institutionType,
          // Admin data
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminIcNumber: formData.adminIcNumber,
          adminPassword: formData.adminPassword,
          subscriptionPlan: formData.subscriptionPlan
        })
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success(result.message || 'Registration successful!')
      // Redirect to email confirmation page
      router.push(`/auth/confirm-email?email=${encodeURIComponent(formData.adminEmail)}`)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institution Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Institution Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institution Name *</Label>
                <Input
                  id="institutionName"
                  placeholder="ABC High School"
                  value={formData.institutionName}
                  onChange={(e) => updateFormData('institutionName', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionCode">Registration Number</Label>
                <Input
                  id="institutionCode"
                  placeholder="ABC001 (optional)"
                  value={formData.institutionCode}
                  onChange={(e) => updateFormData('institutionCode', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionType">Institution Type</Label>
              <Select
                value={formData.institutionType}
                onValueChange={(value) => updateFormData('institutionType', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Admin Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Administrator Account</h3>
            
            <div className="space-y-2">
              <Label htmlFor="adminName">Administrator Name *</Label>
              <Input
                id="adminName"
                placeholder="John Smith"
                value={formData.adminName}
                onChange={(e) => updateFormData('adminName', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Administrator Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@abchighschool.edu"
                value={formData.adminEmail}
                onChange={(e) => updateFormData('adminEmail', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminIcNumber">Administrator IC Number *</Label>
              <Input
                id="adminIcNumber"
                placeholder="123456-78-9012"
                value={formData.adminIcNumber}
                onChange={(e) => updateFormData('adminIcNumber', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.adminPassword}
                  onChange={(e) => updateFormData('adminPassword', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-4">
            <h3 className="font-semibold">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === 'free'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('subscriptionPlan', 'free')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h4 className="font-semibold">Free Plan</h4>
                  </div>
                  {formData.subscriptionPlan === 'free' && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Perfect for small institutions getting started
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Basic user management</li>
                  <li>• Simple attendance tracking</li>
                  <li>• Basic biometric enrollment</li>
                  <li>• Up to 100 users</li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === 'premium'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateFormData('subscriptionPlan', 'premium')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h4 className="font-semibold">Premium Plan</h4>
                  </div>
                  {formData.subscriptionPlan === 'premium' && (
                    <Check className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Full workforce management solution
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Advanced attendance tracking</li>
                  <li>• Leave management system</li>
                  <li>• Work group scheduling</li>
                  <li>• Advanced analytics & reporting</li>
                  <li>• Unlimited users</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Institution...
              </>
            ) : (
              'Create Institution Account'
            )}
          </Button>

        {onToggleForm && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
              onClick={onToggleForm}
              disabled={loading}
            >
              Sign in here
            </button>
          </div>
        )}
      </form>
  )
}
