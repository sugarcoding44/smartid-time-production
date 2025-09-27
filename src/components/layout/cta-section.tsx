import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/translation-context'

export function CTASection() {
  const { t } = useTranslation()
  
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-4">
          {t('ctaTitle')}
        </h2>
        <p className="text-xl mb-8 opacity-90">
          {t('ctaSubtitle')}
        </p>
        <Button size="lg" variant="secondary" asChild className="bg-white text-indigo-600 hover:bg-gray-100">
          <Link href="/auth/signup">{t('ctaButton')}</Link>
        </Button>
      </div>
    </section>
  )
}
