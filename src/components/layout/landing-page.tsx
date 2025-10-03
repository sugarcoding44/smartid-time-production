'use client'

import React from 'react'
import { Header } from './header'
import { HeroSection } from './hero-section'
import { EcosystemOverviewSection } from './ecosystem-overview-section'
import { SimpleFeaturesSection } from './simple-features-section'
import { HardwareSection } from './hardware-section'
import { CTASection } from './cta-section'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main>
        <HeroSection />
        <EcosystemOverviewSection />
        <SimpleFeaturesSection />
        <HardwareSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
