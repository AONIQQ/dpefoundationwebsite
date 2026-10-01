import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scholarship Committee | Delta Phi Epsilon Foundation',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
