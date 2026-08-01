// Centralized donation configuration.
//
// Donorbox is the chosen processor. The account itself does not exist yet: it
// has to be created under a Foundation-owned address (ideally info@ on the
// Foundation domain) rather than a personal one, since the address that creates
// a Donorbox account controls its payout settings.
//
// Until that account exists and `checkoutBaseUrl` is filled in, the /donate page
// runs in "informational" mode: it presents the case for giving, gift levels
// tied to real programs, and the "other ways to give" fallbacks (check by mail /
// contact), while the primary CTA explains that online card giving is being
// finalized.
//
// To go live, set `checkoutBaseUrl` to the campaign page below
// (e.g. 'https://donorbox.org/dpe-foundation'). `buildCheckoutUrl()` will then
// route the CTA there. Card data is always collected on Donorbox's hosted
// checkout, never on this site.

export const ORG = {
  legalName: 'Delta Phi Epsilon Foundation for Foreign Service Education',
  // EIN is public record (IRS / ProPublica). Treasurer/counsel should confirm
  // via the IRS Tax Exempt Organization Search before public launch.
  ein: '52-1351011',
  addressName: 'Georgetown Court',
  addressLine: '3222 N Street NW, Washington, DC 20007',
} as const

export type Frequency = 'one-time' | 'monthly'

// Lead sentence above the giving buttons, to give the page a content headline
// that draws into the CTA rather than opening cold on a form. Copy and the
// $45,000 figure are confirmed by the Fundraising Committee.
export const IMPACT_HEADLINE =
  'Last year, the Foundation awarded more than $45,000 in scholarships and internship ' +
  'grants for the next generation of diplomats and global leaders, and with your support, ' +
  'we’re expanding that work.'

export interface GivingLevel {
  /** One-time gift amount, and the identity of the level. */
  amount: number
  /** Monthly equivalent shown when the donor toggles to recurring giving. */
  monthly: number
  title: string
  description: string
}

// Levels are set by the Fundraising Committee (Mullick, 6/28): a $100 entry
// point that can also be given as $10/month to give younger brothers a way in,
// then $250 / $500 / $1,000.
//
// Where an amount maps to a real award, the description says so, using the
// figures published on the program pages:
//   Bleakley FSOT scholarship: $250/recipient
//   Stanley Weiss / Halleck Butts scholarships: $500 each
// The $300 STIA Award no longer has its own button; it is still reachable
// through the custom amount field.
export const GIVING_LEVELS: GivingLevel[] = [
  {
    amount: 100,
    monthly: 10,
    title: 'Start giving back',
    description:
      'A straightforward place to start. Gifts at this level combine to fund scholarships, awards, and the lecture series, and can be given as $10 per month.',
  },
  {
    amount: 250,
    monthly: 25,
    title: 'Send a student to the Foreign Service exam',
    description:
      'Funds one Kenneth W. Bleakley Senior Foreign Service Officer Scholarship ($250 per recipient).',
  },
  {
    amount: 500,
    monthly: 50,
    title: 'Back a future global leader',
    description:
      'Provides one Stanley Weiss or Halleck A. Butts scholarship ($500 each) for Georgetown students.',
  },
  {
    amount: 1000,
    monthly: 100,
    title: 'Expand programming',
    description:
      'Helps grow scholarships, STIA Awards, the lecture series, and student programming across the Foundation.',
  },
]

// Designation taxonomy set by the Fundraising Committee (Grasso, 7/26). One
// list backs three places, so they cannot drift: the dropdown on /donate, the
// printable form at /donate/designation-form that goes back with a check, and
// the designation block in the appeal letters.
export const DESIGNATION_UNRESTRICTED = 'Where it’s needed most'

// Picking either of these means the donor has to say what they intend, so the
// form reveals a free-text field. Compared by identity in needsDescription().
export const DESIGNATION_OTHER = 'Other'
export const DESIGNATION_OTHER_SCHOLARSHIP = 'Other scholarship'

export interface DesignationGroup {
  label: string
  options: string[]
}

export const DESIGNATION_GROUPS: DesignationGroup[] = [
  {
    label: 'Scholarships',
    options: [
      'Bleakley',
      'Weiss',
      'Butts',
      'LeMoine',
      'Brotherhood: Undergraduates',
      'Brotherhood: Graduates',
      'Brotherhood: Alumni Children',
      DESIGNATION_OTHER_SCHOLARSHIP,
    ],
  },
  {
    label: 'Awards',
    options: ['Landegger', 'STIA'],
  },
  {
    label: 'House',
    options: ['Acquisition', 'Maintenance'],
  },
]

// Top-level designations with no sub-options. Kept separate from the groups so
// neither the dropdown nor the printed form shows a heading with a single item
// repeating it.
export const STANDALONE_DESIGNATIONS: string[] = [
  'Programs and Lectures',
  'General Administrative',
  DESIGNATION_OTHER,
]

/** True when the donor must describe the intended use in their own words. */
export function needsDescription(designation: string): boolean {
  return designation === DESIGNATION_OTHER || designation === DESIGNATION_OTHER_SCHOLARSHIP
}

/**
 * Prefixes an option with its group so the value is unambiguous once it leaves
 * the form. "Maintenance" and "Acquisition" mean nothing on a gift record on
 * their own; "House: Maintenance" does. Options that already name their parent
 * (the Brotherhood entries) and standalone options are returned untouched.
 */
export function qualifyDesignation(option: string): string {
  if (option.includes(':')) return option
  const group = DESIGNATION_GROUPS.find((g) => g.options.includes(option))
  return group ? `${group.label}: ${option}` : option
}

/**
 * Combines the picked designation with any free-text description, producing the
 * single string that travels to checkout and onto the gift record.
 */
export function formatDesignation(designation: string, description: string): string {
  const qualified = qualifyDesignation(designation)
  const detail = description.trim()
  if (!needsDescription(designation) || !detail) return qualified
  return `${qualified}: ${detail}`
}

/**
 * How a mailed gift was paid, for the printable designation form.
 *
 * "Given online" only appears once there is a live checkout to have given
 * through. Listing it while the page still says online card giving is being
 * finalized would offer donors a box they cannot truthfully tick.
 */
export function paymentMethods(): string[] {
  return [
    'Check enclosed',
    ...(isCheckoutLive() ? ['Given online at dpefoundation.org/donate'] : []),
    'Appreciated securities / stock',
    'Donor-advised fund grant',
    'IRA qualified charitable distribution',
  ]
}

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
  provider: 'donorbox',
  // Live campaign, created 2026-07-29. The amount and default_interval prefill
  // params below were verified against this URL by hand.
  //
  // NOTE: setting this non-empty is what turns the online path on. Leave it
  // empty until a payment processor is connected in Donorbox, or donors reach
  // a form that cannot take their money.
  checkoutBaseUrl: 'https://donorbox.org/delta-phi-epsilon-foundation',
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
    // Donorbox prefill params. Verify these against the live campaign once the
    // account exists: a wrong param name silently drops the prefill rather than
    // erroring, so the donor would land on an empty form.
    if (params.amount > 0) url.searchParams.set('amount', String(params.amount))
    url.searchParams.set('default_interval', params.frequency === 'monthly' ? 'm' : 'o')
    // Only sends if matching designations are configured on the campaign.
    if (params.designation) url.searchParams.set('designation', params.designation)
    return url.toString()
  } catch {
    return null
  }
}
