'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { useTranslation } from '@/contexts/translation-context'
import { 
  ChevronDown, 
  Monitor, 
  Smartphone, 
  CreditCard, 
  Hand, 
  Shield, 
  GraduationCap,
  Store,
  Building2,
  BookOpen,
  FileText,
  LifeBuoy,
  Users,
  Target,
  Award,
  Phone,
  Mail,
  Menu,
  X
} from 'lucide-react'

export function Header() {
  const { t } = useTranslation()
  const [activeDrop, setActiveDrop] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const handleDropdownToggle = (dropdown: string) => {
    setActiveDrop(activeDrop === dropdown ? null : dropdown)
  }

  const closeAllDropdowns = () => {
    setActiveDrop(null)
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-800/30 z-50">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg hover:shadow-xl transition-shadow">
            S
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            smartID
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-6 text-gray-600 dark:text-gray-300 font-medium">
          
          {/* Solutions Dropdown */}
          <li className="relative">
            <button
              onClick={() => handleDropdownToggle('solutions')}
              onMouseEnter={() => setActiveDrop('solutions')}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group py-2"
            >
              Solutions
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDrop === 'solutions' ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {activeDrop === 'solutions' && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="p-4 space-y-1">
                  <Link 
                    href="/solutions/education" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">For Education</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Schools & Universities</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/solutions/retail" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">For Retail & F&B</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Restaurants & Stores</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/solutions/enterprise" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">For Enterprise</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Corporate & Government</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </li>

          {/* Products Dropdown */}
          <li className="relative">
            <button
              onClick={() => handleDropdownToggle('products')}
              onMouseEnter={() => setActiveDrop('products')}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group py-2"
            >
              Products
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDrop === 'products' ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {activeDrop === 'products' && (
              <div 
                className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
                onMouseLeave={closeAllDropdowns}
              >
                {/* Software Systems */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Software Systems</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/smartid-time" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                      onClick={closeAllDropdowns}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">smartID TIME</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Attendance & Management</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-pos" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                      onClick={closeAllDropdowns}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">smartID POS</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Point of Sale System</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-pay" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                      onClick={closeAllDropdowns}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">smartID PAY</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Mobile e-Wallet</div>
                      </div>
                    </Link>
                  </div>
                </div>
                
                <div className="border-t border-gray-200/50 dark:border-gray-700/50"></div>
                
                {/* Hardware Devices */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Hardware Devices</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/smartid-palm" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                      onClick={closeAllDropdowns}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Hand className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Biometric Scanner</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Palm & Face Recognition</div>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/smartid-card" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                      onClick={closeAllDropdowns}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Smart Cards</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">NFC Cards & Printer</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Resources Dropdown */}
          <li className="relative">
            <button
              onClick={() => handleDropdownToggle('resources')}
              onMouseEnter={() => setActiveDrop('resources')}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group py-2"
            >
              Resources
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDrop === 'resources' ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {activeDrop === 'resources' && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="p-4 space-y-1">
                  <Link 
                    href="/resources/documentation" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Documentation</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Guides & API docs</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/resources/case-studies" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Case Studies</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Success stories</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/resources/support" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <LifeBuoy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Support Center</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Help & tutorials</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </li>

          {/* Company Dropdown */}
          <li className="relative">
            <button
              onClick={() => handleDropdownToggle('company')}
              onMouseEnter={() => setActiveDrop('company')}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group py-2"
            >
              Company
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDrop === 'company' ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {activeDrop === 'company' && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="p-4 space-y-1">
                  <Link 
                    href="/company/about" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">About Us</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Our mission & vision</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/company/team" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Our Team</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Meet the experts</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/company/achievements" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Achievements</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Awards & recognition</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/contact" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors group"
                    onClick={closeAllDropdowns}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Contact Us</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Get in touch</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </li>
        </ul>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Portal Links - Hidden on smaller screens */}
          <div className="hidden xl:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/auth/signin">TIME Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/pos-portal">POS Portal</Link>
            </Button>
          </div>
          
          {/* CTA Button */}
          <Button asChild className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            <Link href="/register">Get Started</Link>
          </Button>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solutions</div>
              <Link href="/solutions/education" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>For Education</Link>
              <Link href="/solutions/retail" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>For Retail & F&B</Link>
              <Link href="/solutions/enterprise" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>For Enterprise</Link>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Products</div>
              <Link href="/smartid-time" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>smartID TIME</Link>
              <Link href="/smartid-pos" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>smartID POS</Link>
              <Link href="/smartid-pay" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>smartID PAY</Link>
              <Link href="/smartid-palm" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>Biometric Scanner</Link>
              <Link href="/smartid-card" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>Smart Cards</Link>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</div>
              <Link href="/company/about" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link href="/company/team" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>Our Team</Link>
              <Link href="/contact" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
            </div>
            
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
              <div className="flex flex-col gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>TIME Portal</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/pos-portal" onClick={() => setIsMobileMenuOpen(false)}>POS Portal</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
