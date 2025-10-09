'use client'

import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  GraduationCap,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Users,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react'

export default function SmartIDTimeDenaxPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero - Purple panel style */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Soft background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Left purple card like the reference hero */}
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 text-white p-10 lg:p-14 shadow-[0_10px_30px_rgba(109,40,217,0.35)]">
            {/* top nav-like row */}
            <div className="flex items-center justify-between mb-8">
              <div className="font-semibold tracking-wide">smartID TIME</div>
              <div className="inline-flex items-center gap-2 text-violet-100/90 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live Preview
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Complete school management system
            </h1>
            <p className="mt-4 text-violet-50/90 text-lg md:text-xl">
              Free basic plan included. Upgrade any time for advanced attendance, leave management,
              analytics and biometric device integration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8 py-6 shadow-lg">
                <Link href="/register">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Start Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/10 px-8 py-6">
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch demo
              </Button>
            </div>

            {/* mini mockups row */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <div className="flex items-center justify-between text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    TIME Admin
                  </div>
                  <span className="text-emerald-200">98.5% attendance</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { value: '1,247', label: 'Students' },
                    { value: '45', label: 'New' },
                    { value: '12', label: 'Leaves' }
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-white/5 p-3 text-center">
                      <div className="text-white font-bold">{s.value}</div>
                      <div className="text-xs text-white/80">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <div className="flex items-center justify-between text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    Biometrics
                  </div>
                  <span className="text-fuchsia-200">Palm & NFC</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {['Palm ID', 'Smart Card', 'Real-time', 'Secure'].map((t, i) => (
                    <div key={i} className="rounded-xl bg-white/5 p-3 text-center text-sm text-white/90">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right - facts and badges similar to the reference white area */}
          <div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                <Sparkles className="w-4 h-4" />
                SmartID ecosystem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Experience the best of smartID TIME
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Powerful tools for enrollment, attendance, leave, analytics and device integrations.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {[
                  { title: 'Free Basic', desc: 'Start at no cost', tone: 'from-violet-500 to-fuchsia-500' },
                  { title: 'Premium', desc: 'Advanced features', tone: 'from-indigo-500 to-violet-600' },
                  { title: 'Enterprise', desc: 'Ecosystem + devices', tone: 'from-fuchsia-500 to-pink-600' }
                ].map((k, i) => (
                  <div key={i} className="group p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.tone} text-white flex items-center justify-center mb-3`}>★</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{k.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{k.desc}</div>
                  </div>
                ))}
              </div>

              {/* trust stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-xs uppercase text-gray-500">Schools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">250K+</div>
                  <div className="text-xs uppercase text-gray-500">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
                  <div className="text-xs uppercase text-gray-500">Uptime</div>
                </div>
              </div>

              {/* badges like the screenshot */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">Free Basic Plan</Badge>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Premium Available</Badge>
                <Badge className="bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">Biometric Devices</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How you benefit section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How your institution benefits</h3>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Start free and scale when you need to. Upgrade to premium for advanced attendance, leave
              workflows, analytics dashboards, and seamless device integration.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Student enrollment & records',
                'Advanced attendance tracking',
                'Leave request management',
                'Analytics & reporting',
                'Palm & NFC integrations'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing summary cards in Denax-style small widgets */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/30">
              <CardHeader className="pb-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center mx-auto mb-2">🎉</div>
                <CardTitle className="text-violet-700 dark:text-violet-300">Basic</CardTitle>
                <CardDescription>FREE forever</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" />Up to 100 students</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" />Enrollment & staff</li>
                </ul>
                <Button asChild className="mt-4 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  <Link href="/register">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-2">⚡</div>
                <CardTitle>Premium</CardTitle>
                <CardDescription>RM 100 / month</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-600" />Advanced attendance</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-600" />Analytics & reports</li>
                </ul>
                <Button asChild variant="outline" className="mt-4 w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white">
                  <Link href="/register">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA footer band like reference */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl p-10 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(109,40,217,0.35)]">
            <div>
              <h3 className="text-3xl font-bold">Ready to transform your school?</h3>
              <p className="opacity-90 mt-2">Start with the free plan or schedule a demo to see premium features in action.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8">
                <Link href="/register">Start Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/10 px-8">
                <Link href="/contact">Schedule a demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}