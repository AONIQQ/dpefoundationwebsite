// Centralized donation configuration.
//
// The payment platform is intentionally NOT chosen yet (board decision pending).
// Until a provider is selected, the /donate page runs in "informational" mode:
// it presents the case for giving, gift levels tied to real programs, and the
// "other ways to give" fallbacks (check by mail / contact), while the primary
// CTA explains that online card giving is being finalized.
//
// When the board picks a processor, set `provider` + `checkoutBaseUrl` below
// (e.g. a Stripe Payment Link or a Donorbox page). `buildCheckoutUrl()` will
// then route the CTA there. Card data must always be collected on the
// provider's hosted checkout — never on this site.

export const ORG = {
  legalName: 'Delta Phi Epsilon Foundation for Foreign Service Education',
  // EIN is public record (IRS / ProPublica). Treasurer/counsel should confirm
  // via the IRS Tax Exempt Organization Search before public launch.
  ein: '52-1351011',
  addressName: 'Georgetown Court',
  addressLine: '3222 N Street NW, Washington, DC 20007',
} as const

export type Frequency = 'one-time' | 'monthly'

export interface GivingLevel {
  amount: number
  title: string
  description: string
}

// Amounts are taken directly from the published program pages so a donor's
// gift maps to something concrete:
//   Bleakley FSOT scholarship — $250/recipient
//   STIA awards — $300 each
//   Stanley Weiss / Halleck Butts scholarships — $500 each
export const GIVING_LEVELS: GivingLevel[] = [
  {
    amount: 250,
    title: 'Send a student to the Foreign Service exam',
    description:
      'Funds one Kenneth W. Bleakley Senior Foreign Service Officer Scholarship ($250 per recipient).',
  },
  {
    amount: 300,
    title: 'Recognize service and innovation',
    description:
      'Underwrites one STIA Award ($300 each), created with Georgetown’s School of Foreign Service.',
  },
  {
    amount: 500,
    title: 'Back a future global leader',
    description:
      'Provides one Stanley Weiss or Halleck A. Butts scholarship ($500 each) for Georgetown students.',
  },
  {
    amount: 1000,
    title: 'Expand programming',
    description:
      'Helps grow scholarships, the lecture series, and student programming across the Foundation.',
  },
]

// Board-approved designations — confirm the final list before launch.
export const DESIGNATIONS = [
  'Where it’s needed most',
  'Scholarships & Awards',
  'Programs & Lectures',
  'Facilities (Alpha House Fund)',
] as const

// Documents a donor may need to substantiate a gift — e.g. for a donor-advised
// fund, an employer matching-gift request, or their own records. These are the
// Foundation's existing IRS letters (already published on the Policies page).
//
// NOTE: the deductible *receipt* for a specific gift (the contemporaneous
// written acknowledgment the IRS requires for gifts of $250+) is issued per
// donation by the processor/treasurer after the gift — it is not a blank
// downloadable form. Confirm the labels below with the treasurer before launch.
export const TAX_DOCUMENTS = [
  { label: 'IRS Tax-Exemption Letter', file: '/DPE_IRS_Tax_Exemption_Letter.pdf' },
  { label: 'IRS Determination Letter', file: '/IRS_Letter.pdf' },
] as const

type Provider = 'pending' | 'stripe-link' | 'donorbox' | 'paypal' | 'custom'

export const DONATION: { provider: Provider; checkoutBaseUrl: string } = {
  provider: 'pending',
  // e.g. 'https://donate.stripe.com/xxxxxx' or 'https://donorbox.org/dpe-foundation'
  checkoutBaseUrl: '',
}

export function isCheckoutLive(): boolean {
  return DONATION.provider !== 'pending' && DONATION.checkoutBaseUrl.length > 0
}

export function buildCheckoutUrl(params: {
  amount: number
  frequency: Frequency
  designation: string
}): string | null {
  if (!isCheckoutLive()) return null
  try {
    const url = new URL(DONATION.checkoutBaseUrl)
    // Exact prefill params depend on the chosen provider; wire these precisely
    // when the platform is selected.
    if (params.amount > 0) url.searchParams.set('amount', String(params.amount))
    if (params.frequency) url.searchParams.set('frequency', params.frequency)
    if (params.designation) url.searchParams.set('designation', params.designation)
    return url.toString()
  } catch {
    return null
  }
}
