'use client'

import React from 'react'
import { Header } from './header'
import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { TechnologySection } from './technology-section'
import { HardwareSection } from './hardware-section'
import { HowItWorksSection } from './how-it-works-section'
import { PricingSection } from './pricing-section'
import { CTASection } from './cta-section'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TechnologySection />
        <HardwareSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
