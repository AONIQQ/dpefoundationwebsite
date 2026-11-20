'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { NAV_SECTIONS } from '@/app/components/site-nav'

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<number | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setMobileMenuOpen(false)
      if (navRef.current && !navRef.current.contains(target)) setOpenSection(null)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpenSection(null); setMobileMenuOpen(false) }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  useEffect(() => { setOpenSection(null); setMobileMenuOpen(false) }, [pathname])

  const inSection = (i: number) => NAV_SECTIONS[i].links.some((l) => pathname === l.href || pathname?.startsWith(`${l.href}/`))

  return (
    <header className="bg-white/95 py-4 sticky top-0 z-50 shadow-sm border-b border-[#d4af36]/20">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center" aria-label="Delta Phi Epsilon Foundation, home">
          <Image
            src="/DPE.png"
            alt="Delta Phi Epsilon Foundation for Foreign Service Education"
            width={240}
            height={60}
            priority
            className="h-12 w-auto sm:h-14 md:h-16"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <nav ref={navRef} aria-label="Main" className="hidden xl:flex items-center gap-1">
            {NAV_SECTIONS.map((section, i) => (
              <div key={section.label} className="relative" onMouseEnter={() => setOpenSection(i)} onMouseLeave={() => setOpenSection(null)}>
                <button
                  type="button"
                  aria-expanded={openSection === i}
                  aria-controls={`nav-menu-${i}`}
                  // Hover already opens it on a mouse, so a click only opens; Escape or clicking away closes.
                  onClick={() => setOpenSection(i)}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-base transition duration-300 hover:text-[#9a7b22] ${inSection(i) ? 'text-[#80651d] font-semibold' : 'text-[#b08d28]'}`}
                >
                  {section.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSection === i ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {openSection === i && (
                  <div id={`nav-menu-${i}`} className="absolute left-0 top-full pt-2">
                    <ul className="min-w-[16rem] rounded-lg border border-[#d4af36]/30 bg-white py-2 shadow-lg">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            aria-current={pathname === link.href ? 'page' : undefined}
                            className={`block px-4 py-2 text-[15px] hover:bg-[#faf8f5] hover:text-[#9a7b22] ${pathname === link.href ? 'text-[#80651d] font-semibold' : 'text-gray-800'}`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <Link href="/donate">
            <Button className="bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white rounded-full px-5">
              Donate
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="xl:hidden text-[#b08d28]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="xl:hidden bg-white py-4 px-4 absolute top-full left-0 right-0 shadow-lg border-t border-[#d4af36]/20 max-h-[calc(100vh-6rem)] overflow-y-auto"
        >
          <div className="flex justify-end mb-2">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6 text-[#b08d28]" />
            </Button>
          </div>
          <div className="mx-auto max-w-md space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 text-center">{section.label}</p>
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-[#b08d28] hover:text-[#9a7b22] transition duration-300 text-lg text-center"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
