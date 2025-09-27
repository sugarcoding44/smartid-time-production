import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/translation-context'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Security', href: '#security' },
    { name: 'Integrations', href: '#integrations' }
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press', href: '#press' },
    { name: 'Contact', href: '#contact' }
  ],
  support: [
    { name: 'Help Center', href: '#help' },
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
    { name: 'Status', href: '#status' }
  ]
}

export function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 text-2xl font-bold text-white mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold">
                s
              </div>
              smartID
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Complete school management system with biometric authentication, attendance tracking, and smart card management for educational institutions.
            </p>
          </div>
          
          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
