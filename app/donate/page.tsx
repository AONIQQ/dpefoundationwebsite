'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, Mail, ShieldCheck, FileText, ArrowRight, Download } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import AnimatedSection from '@/app/components/AnimatedSection'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import {
  ORG,
  GIVING_LEVELS,
  DESIGNATIONS,
  TAX_DOCUMENTS,
  buildCheckoutUrl,
  isCheckoutLive,
  type Frequency,
} from '@/lib/donation'

const CARD =
  'bg-[#fdfcf9] rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]'

const PRESETS = GIVING_LEVELS.map((l) => l.amount)

export default function DonatePage() {
  const [frequency, setFrequency] = useState<Frequency>('one-time')
  const [preset, setPreset] = useState<number | null>(250)
  const [customAmount, setCustomAmount] = useState('')
  const [designation, setDesignation] = useState<string>(DESIGNATIONS[0])
  const [showPending, setShowPending] = useState(false)

  const amount = useMemo(() => {
    if (customAmount.trim()) {
      const n = Number(customAmount.replace(/[^0-9.]/g, ''))
      // Floor to whole dollars so a donor is never charged more than they typed.
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
    }
    return preset ?? 0
  }, [customAmount, preset])

  const handleContinue = () => {
    const url = buildCheckoutUrl({ amount, frequency, designation })
    if (url) {
      window.location.href = url
      return
    }
    // Platform not chosen yet — reveal the fallback and scroll to it.
    setShowPending(true)
    requestAnimationFrame(() => {
      document.getElementById('other-ways')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,54,0.06)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 text-[#b08d28] text-xs sm:text-sm tracking-[0.25em] uppercase">
              <Heart className="h-4 w-4" /> Support the Foundation
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-black max-w-4xl mx-auto leading-tight">
              Support the next generation of foreign service leaders
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <OrnamentalDivider className="my-8" />
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Since 1962, the {ORG.legalName} has advanced the study and practice of foreign
              service through scholarships, awards, lectures, and student programming. Your gift
              puts those opportunities directly into students’ hands.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16 sm:pb-20">
        {/* Gift form */}
        <AnimatedSection className="max-w-2xl mx-auto">
          <div className={`${CARD} p-6 sm:p-8`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#b08d28] text-center">Make a gift</h2>
            <div className="w-16 h-px bg-[#d4af36]/40 mx-auto mt-4 mb-6" />

            {/* Frequency */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#f5f0e8] mb-6">
              {(['one-time', 'monthly'] as Frequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  aria-pressed={frequency === f}
                  className={`rounded-full py-2.5 text-sm sm:text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 ${
                    frequency === f
                      ? 'bg-[#d4af36] text-white shadow-sm'
                      : 'text-[#b08d28] hover:bg-[#ece4d6]'
                  }`}
                >
                  {f === 'one-time' ? 'One-time' : 'Monthly'}
                </button>
              ))}
            </div>

            {/* Amount presets */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">Choose an amount</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {PRESETS.map((value) => {
                const active = !customAmount.trim() && preset === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPreset(value)
                      setCustomAmount('')
                    }}
                    aria-pressed={active}
                    className={`rounded-xl py-3 text-lg font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 ${
                      active
                        ? 'bg-[#d4af36] text-white border-[#d4af36] shadow-sm'
                        : 'bg-[#fdfcf9] text-[#b08d28] border-[#d4af36]/40 hover:bg-[#f5f0e8] hover:border-[#d4af36]'
                    }`}
                  >
                    ${value}
                  </button>
                )
              })}
            </div>

            {/* Custom amount */}
            <label htmlFor="custom-amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Or enter another amount
            </label>
            <div className="relative mb-6">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <Input
                id="custom-amount"
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  if (e.target.value.trim()) setPreset(null)
                }}
                placeholder="Whole dollars"
                aria-label="Custom donation amount in whole dollars"
                className="pl-8 bg-[#fdfcf9] text-black border-gray-300 focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1"
              />
            </div>

            {/* Designation */}
            <label htmlFor="designation" className="block text-sm font-semibold text-gray-700 mb-2">
              Direct my gift to
            </label>
            <select
              id="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-[#fdfcf9] text-black px-3 py-2.5 mb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1"
            >
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <Button
              onClick={handleContinue}
              disabled={amount <= 0}
              className="w-full bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white text-base sm:text-lg py-6 rounded-full transition duration-300 disabled:opacity-50"
            >
              {amount > 0
                ? `Continue with $${amount}${frequency === 'monthly' ? '/mo' : ''}`
                : 'Choose an amount to continue'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {showPending && !isCheckoutLive() && (
              <div className="mt-4 rounded-xl border border-[#d4af36]/40 bg-[#f5f0e8] p-4 text-sm text-gray-700 leading-relaxed">
                Online card giving is being finalized. In the meantime, you can make your gift today
                using the <span className="font-semibold text-[#b08d28]">Other ways to give</span> below —
                thank you for your support.
              </div>
            )}

            <p className="mt-4 text-center text-xs text-gray-500">
              {isCheckoutLive() ? 'Secure checkout · ' : ''}
              {ORG.legalName} is a 501(c)(3) organization
            </p>
          </div>
        </AnimatedSection>

        {/* What your gift funds */}
        <section className="max-w-5xl mx-auto mt-16 sm:mt-20">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-black text-center">What your gift funds</h2>
            <OrnamentalDivider className="mb-8 sm:mb-10" />
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-6">
            {GIVING_LEVELS.map((level, i) => (
              <AnimatedSection key={level.amount} delay={i * 0.08}>
                <div className={`${CARD} p-6 h-full flex items-start gap-4`}>
                  <span className="shrink-0 text-2xl font-bold text-[#b08d28] tabular-nums">
                    ${level.amount}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">{level.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{level.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* Other ways to give */}
        <section id="other-ways" className="max-w-5xl mx-auto mt-16 sm:mt-20 scroll-mt-24">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-black text-center">Other ways to give</h2>
            <OrnamentalDivider className="mb-8 sm:mb-10" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection>
              <div className={`${CARD} p-6 h-full`}>
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-[#d4af36]" />
                  <h3 className="text-lg font-semibold text-[#b08d28]">By check</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Make checks payable to <span className="font-semibold">{ORG.legalName}</span> and mail to:
                </p>
                <p className="text-sm text-gray-800 mt-3 leading-relaxed">
                  {ORG.addressName}
                  <br />
                  {ORG.addressLine}
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.08}>
              <div className={`${CARD} p-6 h-full`}>
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-5 w-5 text-[#d4af36]" />
                  <h3 className="text-lg font-semibold text-[#b08d28]">
                    Stock, donor-advised funds &amp; major gifts
                  </h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  For gifts of appreciated securities, donor-advised fund grants, planned giving, or a
                  conversation about a major gift, please{' '}
                  <Link href="/contact" className="text-[#b08d28] hover:text-[#9a7b22] font-medium underline">
                    contact the Foundation
                  </Link>
                  . A trustee will follow up personally.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Trust / tax block */}
        <section className="max-w-3xl mx-auto mt-16 sm:mt-20">
          <AnimatedSection>
            <div className={`${CARD} p-6 sm:p-8`}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-[#d4af36]" />
                <h2 className="text-2xl font-bold text-[#b08d28]">Your gift is tax-deductible</h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <li>
                  The {ORG.legalName} is a registered 501(c)(3) tax-exempt organization
                  (EIN <span className="font-semibold tabular-nums">{ORG.ein}</span>). Contributions are
                  tax-deductible to the extent allowed by law.
                </li>
                <li>
                  {isCheckoutLive()
                    ? 'Card payments are handled on our payment provider’s hosted, PCI-compliant checkout — your card details are never entered or stored on this website.'
                    : 'When online card giving launches, payments will be handled on a hosted, PCI-compliant checkout — your card details will never be entered or stored on this website.'}
                </li>
                <li>
                  For gifts of $250 or more, the Foundation will provide a written acknowledgment for
                  your tax records.
                </li>
                <li className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                  <Link href="/policies" className="inline-flex items-center gap-1.5 text-[#b08d28] hover:text-[#9a7b22] font-medium">
                    <FileText className="h-4 w-4" /> Policies &amp; public filings
                  </Link>
                  <Link href="/about" className="inline-flex items-center gap-1.5 text-[#b08d28] hover:text-[#9a7b22] font-medium">
                    <FileText className="h-4 w-4" /> About the Foundation
                  </Link>
                </li>
              </ul>

              {/* Tax documents */}
              <div className="mt-6 pt-5 border-t border-[#d4af36]/20">
                <h3 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#b08d28] mb-2">
                  Tax documents
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Download the Foundation’s IRS tax-exemption letter for your records, a donor-advised
                  fund, or an employer matching-gift request. Your gift receipt — the acknowledgment you
                  use to claim your deduction — is provided after you give.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  {TAX_DOCUMENTS.map((doc) => (
                    <a
                      key={doc.file}
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4af36]/50 bg-[#f5f0e8] px-4 py-2.5 text-sm font-medium text-[#b08d28] hover:bg-[#ece4d6] hover:border-[#d4af36] transition-colors"
                    >
                      <Download className="h-4 w-4" /> {doc.label}
                    </a>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-xs text-gray-500 leading-relaxed">
                The Foundation is managed entirely by volunteers; trustees and officers receive no
                compensation. It is not affiliated with Georgetown University or the U.S. government.
              </p>
            </div>
          </AnimatedSection>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
