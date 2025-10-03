'use client'

import { AuthLayout } from '@/components/layout/auth-layout'
import { InstitutionRegisterForm } from '@/components/auth/institution-register-form'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join thousands of institutions already using SmartID TIME"
    >
      <InstitutionRegisterForm />
    </AuthLayout>
  )
}
