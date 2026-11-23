// The site's sections and their pages, shared by the header menu and the
// "In this section" links on each history page.

export interface NavLink { href: string; label: string }
export interface NavSection { label: string; title: string; links: NavLink[] }

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Foundation',
    title: 'Delta Phi Epsilon Foundation for Foreign Service Education',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/programs', label: 'Programs' },
      { href: '/facilities', label: 'Facilities' },
      { href: '/scholarships', label: 'Awards and Scholarships' },
      { href: '/policies', label: 'Policies' },
      { href: '/honored-greeks', label: 'Honored Greeks' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    label: 'Fraternity',
    title: 'Delta Phi Epsilon Foreign Service Fraternity',
    links: [
      { href: '/fraternity/history', label: 'Fraternity History' },
      { href: '/fraternity/articles-of-agreement', label: 'Articles of Agreement' },
      { href: '/fraternity/national-presidents', label: 'National Presidents' },
    ],
  },
  {
    label: 'Collegiate Chapters',
    title: 'Delta Phi Epsilon Collegiate Chapters',
    links: [{ href: '/collegiate-chapters', label: 'Chapter Roll' }],
  },
  {
    label: 'Alpha Chapter',
    title: 'Alpha Chapter',
    links: [
      { href: '/alpha-lineage', label: 'Alpha Lineage' },
      { href: '/alpha-chapter/in-memoriam', label: 'In Memoriam' },
      { href: '/alpha-chapter/history', label: 'Pictorial History' },
      { href: '/alpha-chapter/presidents', label: 'Presidents of Alpha Chapter' },
    ],
  },
  {
    label: 'Washington Alumni',
    title: 'Washington Alumni Association',
    links: [
      { href: '/washington-alumni/history', label: 'History' },
      { href: '/washington-alumni/presidents', label: 'Presidents of WAA' },
    ],
  },
]

export function sectionFor(href: string): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.links.some((l) => l.href === href))
}
