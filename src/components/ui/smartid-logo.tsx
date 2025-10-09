'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

interface SmartIDLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
  className?: string
}

const sizes = {
  sm: { width: 120, height: 30 },
  md: { width: 160, height: 40 },
  lg: { width: 200, height: 50 }
}

export function SmartIDLogo({ 
  size = 'md', 
  showText = true, 
  href = '/', 
  className = '' 
}: SmartIDLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use
  const isDark = mounted && (resolvedTheme === 'dark')
  const logoSrc = isDark ? '/logos/time-logo-dark.svg' : '/logos/time-logo-light.svg'
  const { width, height } = sizes[size]

  const LogoImage = () => (
    <Image
      src={logoSrc}
      alt="SmartID TIME"
      width={width}
      height={height}
      priority
      className={`transition-opacity duration-200 ${className}`}
      style={{ width: 'auto', height: height }}
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-80">
        <LogoImage />
      </Link>
    )
  }

  return <LogoImage />
}