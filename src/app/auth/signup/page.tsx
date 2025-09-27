'use client'

import { AuthLayout } from '@/components/layout/auth-layout'
import { InstitutionRegisterForm } from '@/components/auth/institution-register-form'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Get Started"
      subtitle="Register your institution to start using SmartID HUB"
    >
      <InstitutionRegisterForm />
    </AuthLayout>
  )
}
