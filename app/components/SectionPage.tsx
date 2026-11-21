import Link from 'next/link'
import type { ReactNode } from 'react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import { sectionFor } from '@/app/components/site-nav'

// Layout for the Fraternity, Chapters, Alpha Chapter and Washington Alumni pages:
// section name, title, intro, the body, and links to the other pages in the section.
export default function SectionPage({ href, title, intro, source = true, children }: {
  href: string
  title: string
  intro?: ReactNode
  source?: boolean
  children: ReactNode
}) {
  const section = sectionFor(href)
  const siblings = section?.links.filter((l) => l.href !== href) ?? []
  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          {section && <p className="text-sm font-semibold uppercase tracking-widest text-[#80651d]">{section.title}</p>}
          <h1 className="mt-3 text-4xl font-bold text-black sm:text-5xl">{title}</h1>
          <OrnamentalDivider />
          {intro && <div className="text-lg leading-relaxed text-gray-700">{intro}</div>}
        </header>

        <div className="mt-10">{children}</div>

        {source && (
          <p className="mt-12 text-sm text-gray-500 text-center">Source: Delta Phi Epsilon, Alpha Chapter Pledge Manual (2020).</p>
        )}

        {siblings.length > 0 && (
          <nav aria-label={`More in ${section!.label}`} className="mt-10 border-t border-[#d4af36]/40 pt-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Also in this section</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {siblings.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-[#80651d] underline-offset-4 hover:underline">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
