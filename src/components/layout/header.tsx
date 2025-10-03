'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { useTranslation } from '@/contexts/translation-context'
import { ChevronDown, Monitor, Smartphone, CreditCard, Hand, Shield, Printer } from 'lucide-react'

export function Header() {
  const { t } = useTranslation()
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 z-50">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg">
            S
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            smartID
          </span>
        </Link>
        
        <ul className="hidden md:flex items-center gap-8 text-gray-600 dark:text-gray-300 font-medium">
          {/* Products Dropdown */}
          <li className="relative">
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              onMouseEnter={() => setIsProductsOpen(true)}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group"
            >
              Products
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {/* Dropdown Menu */}
            {isProductsOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                {/* Software Systems */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Software Systems</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/smartid-time" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">smartID TIME</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">School Management System</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-pos" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">smartID POS</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Point of Sale System</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-pay" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">smartID PAY</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Mobile e-Wallet System</div>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                
                {/* Hardware Devices */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Hardware Devices</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/smartid-palm" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Hand className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">smartID Palm</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Biometric Palm Scanner</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-card" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">smartID Card</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">NFC Smart Cards & Printer</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>
          
          <li>
            <Link href="/company" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              Company
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              Contact Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
        </ul>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/auth/signin">TIME Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/pos-portal">POS Portal</Link>
            </Button>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/register">Start Free</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
