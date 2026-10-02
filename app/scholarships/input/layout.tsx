import type { Metadata } from 'next'

// Reached from the Foundation's request to the brotherhood, not from site
// navigation or search.
export const metadata: Metadata = {
  title: 'Scholarship Program Comments | Delta Phi Epsilon Foundation',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
