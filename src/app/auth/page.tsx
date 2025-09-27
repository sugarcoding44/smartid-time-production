'use client'

import { useState } from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { InstitutionRegisterForm } from '@/components/auth/institution-register-form'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <AuthLayout
      title={isLogin ? 'Welcome Back' : 'Get Started'}
      subtitle={isLogin ? 'Sign in to your SmartID HUB account' : 'Register your institution to start using SmartID HUB'}
    >
      {isLogin ? (
        <LoginForm onToggleForm={() => setIsLogin(false)} />
      ) : (
        <InstitutionRegisterForm onToggleForm={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  )
}
