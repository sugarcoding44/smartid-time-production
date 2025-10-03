'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Building2, 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Loader2, 
  Sparkles,
  School,
  GraduationCap,
  Briefcase,
  Building,
  Crown,
  Users,
  Zap,
  Shield,
  Clock,
  ChartBar
} from 'lucide-react'

interface InstitutionRegisterFormProps {
  onToggleForm?: () => void
}

export function InstitutionRegisterForm({ onToggleForm }: InstitutionRegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionCode: '',
    institutionType: '',
    adminName: '',
    adminEmail: '',
    adminIcNumber: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'free' as 'free' | 'premium'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const totalSteps = 4

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register-institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName: formData.institutionName,
          institutionCode: formData.institutionCode,
          institutionType: formData.institutionType,
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.institutionName) {
          toast.error('Please enter institution name')
          return false
        }
        if (!formData.institutionType) {
          toast.error('Please select institution type')
          return false
        }
        return true
      
      case 2:
        if (!formData.adminName || !formData.adminEmail || !formData.adminIcNumber) {
          toast.error('Please fill in all administrator details')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          toast.error('Please enter a valid email address')
          return false
        }
        return true
      
      case 3:
        if (!formData.adminPassword || !formData.confirmPassword) {
          toast.error('Please enter password')
          return false
        }
        if (formData.adminPassword.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (formData.adminPassword !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const institutionTypeIcons = {
    school: { icon: School, color: 'text-blue-500' },
    university: { icon: GraduationCap, color: 'text-purple-500' },
    college: { icon: Building2, color: 'text-indigo-500' },
    corporate: { icon: Briefcase, color: 'text-gray-700' },
    government: { icon: Building, color: 'text-green-600' }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                step <= currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
              }`}>
                {step === 1 ? 'Institution' : step === 2 ? 'Administrator' : step === 3 ? 'Security' : 'Plan'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        {/* Step 1: Institution Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
                <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tell us about your institution</h2>
              <p className="text-gray-600 dark:text-gray-400">Let's start with some basic information</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="institutionName" className="text-base font-medium mb-2 block">
                  Institution Name *
                </Label>
                <Input
                  id="institutionName"
                  placeholder="e.g., Sunway International School"
                  value={formData.institutionName}
                  onChange={(e) => updateFormData('institutionName', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="institutionCode" className="text-base font-medium mb-2 block">
                  Institution Code (Optional)
                </Label>
                <Input
                  id="institutionCode"
                  placeholder="e.g., SIS2025"
                  value={formData.institutionCode}
                  onChange={(e) => updateFormData('institutionCode', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">Registration or reference number</p>
              </div>

              <div>
                <Label htmlFor="institutionType" className="text-base font-medium mb-2 block">
                  Institution Type *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(institutionTypeIcons).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateFormData('institutionType', type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.institutionType === type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <Icon className={`w-6 h-6 mb-2 mx-auto ${config.color}`} />
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Administrator Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
                <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Administrator account</h2>
              <p className="text-gray-600 dark:text-gray-400">This will be the primary admin for your institution</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="adminName" className="text-base font-medium mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="adminName"
                  placeholder="e.g., Ahmad bin Abdullah"
                  value={formData.adminName}
                  onChange={(e) => updateFormData('adminName', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminEmail" className="text-base font-medium mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="e.g., admin@school.edu.my"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData('adminEmail', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">We'll send a verification link to this email</p>
              </div>

              <div>
                <Label htmlFor="adminIcNumber" className="text-base font-medium mb-2 block">
                  IC Number *
                </Label>
                <Input
                  id="adminIcNumber"
                  placeholder="e.g., 901234-14-5678"
                  value={formData.adminIcNumber}
                  onChange={(e) => updateFormData('adminIcNumber', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Secure your account</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose a strong password for your admin account</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="adminPassword" className="text-base font-medium mb-2 block">
                  Password *
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter a strong password"
                  value={formData.adminPassword}
                  onChange={(e) => updateFormData('adminPassword', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center gap-2 text-sm ${
                    formData.adminPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formData.adminPassword.length >= 6 ? 
                      <Check className="w-4 h-4" /> : 
                      <div className="w-4 h-4 rounded-full border-2 border-current" />
                    }
                    At least 6 characters
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-base font-medium mb-2 block">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  required
                />
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm mt-2 ${
                    formData.adminPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.adminPassword === formData.confirmPassword ? 
                      <><Check className="w-4 h-4" /> Passwords match</> : 
                      <>Passwords do not match</>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Choose Plan */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4">
                <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
              <p className="text-gray-600 dark:text-gray-400">Start free or unlock premium features</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <button
                type="button"
                onClick={() => updateFormData('subscriptionPlan', 'free')}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  formData.subscriptionPlan === 'free'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                {formData.subscriptionPlan === 'free' && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Selected
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-bold">Free Forever</h3>
                    </div>
                    <p className="text-3xl font-bold">RM 0<span className="text-sm font-normal text-gray-500">/month</span></p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Perfect for small institutions getting started
                </p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Up to 100 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Basic attendance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>User management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Basic reporting</span>
                  </li>
                </ul>
              </button>

              {/* Premium Plan */}
              <button
                type="button"
                onClick={() => updateFormData('subscriptionPlan', 'premium')}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  formData.subscriptionPlan === 'premium'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                {formData.subscriptionPlan === 'premium' && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Selected
                    </div>
                  </div>
                )}
                
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Most Popular
                  </Badge>
                </div>
                
                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-6 h-6 text-amber-500" />
                      <h3 className="text-xl font-bold">Premium</h3>
                    </div>
                    <p className="text-3xl font-bold">RM 100<span className="text-sm font-normal text-gray-500">/month</span></p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Complete workforce management solution
                </p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span className="font-medium">Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Advanced attendance & leave management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Work group scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Analytics & custom reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">30-day free trial</span> for Premium features. No credit card required.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          )}
          
          <div className={currentStep === 1 ? 'ml-auto' : ''}>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sign In Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a 
            href="/auth/signin" 
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  )
}