'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Moon, Sun, X } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useDarkMode } from '@/app/components/useDarkMode'

const NAV_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/programs', label: 'Programs' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/scholarships', label: 'Awards and Scholarships' },
  { href: '/policies', label: 'Policies' },
  { href: '/contact', label: 'Contact Us' },
]

export default function SiteHeader() {
  const [darkMode, setDarkMode] = useDarkMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white/95 dark:bg-[#0f1729]/95 py-4 sticky top-0 z-50 shadow-sm border-b border-[#d4af36]/20">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center" aria-label="Delta Phi Epsilon Foundation — home">
          {/* Two logos toggled by the `dark` class so the correct one paints before JS runs (no flash). */}
          <Image
            src="/DPE.png"
            alt="Delta Phi Epsilon Foundation for Foreign Service Education"
            width={240}
            height={60}
            priority
            className="h-12 w-auto sm:h-14 md:h-16 dark:hidden"
          />
          <Image
            src="/DPE-inverted.png"
            alt="Delta Phi Epsilon Foundation for Foreign Service Education"
            width={240}
            height={60}
            priority
            className="h-12 w-auto sm:h-14 md:h-16 hidden dark:block"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </nav>

        <Button
          variant="ghost"
          className="md:hidden text-[#d4af36]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </Button>
      </div>

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white dark:bg-[#0f1729] py-4 px-4 absolute top-full left-0 right-0 shadow-lg border-t border-[#d4af36]/20"
        >
          <div className="flex justify-end mb-2">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6 text-[#d4af36]" />
            </Button>
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setDarkMode(!darkMode)
              setMobileMenuOpen(false)
            }}
            className="w-full text-center py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg"
          >
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      )}
    </header>
  )
}
