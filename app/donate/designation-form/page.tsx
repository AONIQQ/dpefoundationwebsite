'use client'

// Printable designation form, to be completed and returned with a mailed gift.
// Structure comes from the Fundraising Committee (Grasso, 7/26): who is giving,
// how the gift should be used, how much and by what method, and the email or
// residential address the IRS acknowledgment goes to.
//
// Online donors complete the equivalent on /donate; this exists for the check
// path, where there is no checkout to capture any of it.

import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import {
  ORG,
  DESIGNATION_GROUPS,
  DESIGNATION_UNRESTRICTED,
  STANDALONE_DESIGNATIONS,
  paymentMethods,
  needsDescription,
} from '@/lib/donation'

/** An empty box the donor ticks by hand. */
function Checkbox() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 shrink-0 border border-gray-500 rounded-[2px] mr-3 translate-y-[2px]"
    />
  )
}

/**
 * A ruled line to write on, labelled to its left.
 *
 * The root must be `flex`, not `inline-flex`: an inline-flex box shrink-wraps,
 * which leaves the rule's `flex-1` nothing to grow into, collapsing every line
 * to its min-width. That produced 1-inch rules nobody could write an address
 * on, and stopped stacked fields from stacking at all.
 */
function WriteIn({ label }: { label: string }) {
  return (
    <span className="flex items-baseline gap-2 min-w-0">
      <span className="text-sm text-gray-700 shrink-0">{label}</span>
      <span className="flex-1 border-b border-gray-400 h-5 min-w-[2rem]" />
    </span>
  )
}

/**
 * One tickable designation. The "Other" entries need somewhere to write, so
 * they get a ruled line instead of a plain label.
 */
function DesignationChoice({ option }: { option: string }) {
  // Inside a narrow column there is no room for a label and a usable rule on
  // the same line, so the describe options get the rule underneath instead.
  if (needsDescription(option)) {
    return (
      <label className="block text-sm text-gray-800 break-inside-avoid">
        <span className="flex items-baseline">
          <Checkbox />
          <span>{option} (describe):</span>
        </span>
        <span className="block border-b border-gray-400 h-5 ml-[1.625rem] mt-0.5" />
      </label>
    )
  }
  return (
    <label className="flex items-baseline text-sm text-gray-800">
      <Checkbox />
      <span>{option}</span>
    </label>
  )
}

function SectionHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-black mt-6 mb-2.5 print:mt-4 print:mb-1.5 break-after-avoid">
      {n}. {children}
    </h2>
  )
}

export default function DesignationFormPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif print:bg-white">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="container mx-auto px-4 py-10 sm:py-14 print:p-0">
        {/* Screen-only controls */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 text-[#b08d28] hover:text-[#9a7b22] font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to giving
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] px-5 py-2.5 text-white font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-2"
          >
            <Printer className="h-4 w-4" /> Print this form
          </button>
        </div>

        {/* The form itself */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36] p-8 sm:p-10 print:shadow-none print:border-0 print:rounded-none print:p-0 print:max-w-none">
          <header className="text-center border-b border-[#d4af36]/40 pb-5 mb-6 print:pb-3 print:mb-4">
            <h1 className="text-2xl sm:text-3xl print:text-xl font-bold text-black">Designation of Contribution</h1>
            <p className="mt-2 text-sm print:text-xs text-gray-600">{ORG.legalName}</p>
            <p className="text-sm print:text-xs text-gray-600">
              {ORG.addressName}, {ORG.addressLine}
            </p>
          </header>

          {/* Donor */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <span className="flex-[2] min-w-[14rem]">
              <WriteIn label="Name:" />
            </span>
            <span className="flex-1 min-w-[9rem]">
              <WriteIn label="Line:" />
            </span>
          </div>

          <SectionHeading n={1}>Designate how your contribution will be used</SectionHeading>

          <label className="flex items-start text-sm text-gray-800 mb-3 print:mb-2">
            <Checkbox />
            <span>{DESIGNATION_UNRESTRICTED}</span>
          </label>

          {/* Two columns so the whole checklist, and therefore the whole form,
              fits on a single printed page. */}
          <div className="sm:columns-2 sm:gap-10 space-y-4 print:space-y-2">
            {DESIGNATION_GROUPS.map((group) => (
              <div key={group.label} className="break-inside-avoid">
                <h3 className="text-sm font-bold text-[#b08d28] uppercase tracking-[0.08em] mb-1.5">
                  {group.label}
                </h3>
                <div className="pl-1 space-y-1.5 print:space-y-1">
                  {group.options.map((option) => (
                    <DesignationChoice key={option} option={option} />
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-1.5 print:space-y-1 break-inside-avoid">
              {STANDALONE_DESIGNATIONS.map((option) => (
                <DesignationChoice key={option} option={option} />
              ))}
            </div>
          </div>

          <SectionHeading n={2}>Designate the amount and manner of payment</SectionHeading>

          <div className="mb-3 max-w-xs">
            <WriteIn label="Amount: $" />
          </div>
          <div className="sm:columns-2 sm:gap-10 space-y-1.5 print:space-y-1">
            {paymentMethods().map((method) => (
              <label key={method} className="flex items-baseline text-sm text-gray-800 break-inside-avoid">
                <Checkbox />
                <span>{method}</span>
              </label>
            ))}
            <label className="flex items-baseline text-sm text-gray-800 break-inside-avoid">
              <Checkbox />
              <span className="flex-1 min-w-0">
                <WriteIn label="Other (describe):" />
              </span>
            </label>
          </div>
          <p className="mt-2.5 text-xs text-gray-600 leading-relaxed">
            Contributions from individual retirement accounts can qualify to satisfy required minimum
            distributions.
          </p>

          <SectionHeading n={3}>
            Confirm your email address or provide a residential mailing address for IRS documentation of
            your donation
          </SectionHeading>

          <div className="space-y-3">
            <WriteIn label="Email:" />
            <WriteIn label="Residence:" />
            {/* Continuation lines for the rest of the address, indented to sit
                under the Residence rule rather than under its label. */}
            <span className="block border-b border-gray-400 h-5 ml-[5.5rem]" />
          </div>

          <footer className="mt-8 pt-5 print:mt-4 print:pt-3 border-t border-[#d4af36]/40 text-xs print:text-[10px] text-gray-600 leading-relaxed">
            <p>
              Please return this form with your contribution to {ORG.addressName},{' '}
              {ORG.addressLine}. Make checks payable to {ORG.legalName}.
            </p>
            <p className="mt-2">
              The Foundation is a 501(c)(3) tax-exempt organization (EIN {ORG.ein}). Contributions are
              generally tax deductible as an itemized deduction within applicable individual limitations.
            </p>
          </footer>
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  )
}
