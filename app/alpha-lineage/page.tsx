import Image from 'next/image'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import recentLines from '@/content/alpha-lineage.json'

const directories = [
  {
    title: 'Charter members through the 100th Line',
    description: 'The charter members of Alpha Chapter and the pledge lines through the 100th Line.',
    pages: 124,
    href: '/alpha-lineage/alpha-directory-through-100th-line.pdf',
  },
  {
    title: 'Since the 100th Line',
    description: 'The continuation of the directory, covering the 101st through the 207th Lines.',
    pages: 221,
    href: '/alpha-lineage/alpha-directory-since-100th-line.pdf',
  },
]

export default function AlphaLineagePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-black sm:text-5xl md:text-6xl">Alpha Lineage</h1>
          <OrnamentalDivider />
          <p className="text-lg leading-relaxed text-gray-700 sm:text-xl">
            The charter members and pledge lines of Alpha Chapter of Delta Phi Epsilon,
            from its founding in 1920 through the 212th Line in spring 2026.
          </p>
        </header>

        <section aria-labelledby="directories-heading" className="mt-12 border-t border-[#d4af36]/40 pt-8">
          <h2 id="directories-heading" className="mb-6 text-3xl font-semibold">Alpha directories</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {directories.map((directory) => (
              <article key={directory.href} className="rounded-lg border border-[#d4af36]/30 bg-white p-6 sm:p-8">
                <p className="mb-3 text-sm text-gray-600">PDF · {directory.pages} pages</p>
                <h3 className="text-2xl font-semibold text-[#80651d]">{directory.title}</h3>
                <p className="mt-4 leading-relaxed text-gray-700">{directory.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <a href={directory.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#80651d] px-5 py-2.5 font-semibold text-white hover:bg-[#665018]">
                    Read directory <span className="sr-only">— {directory.title} (opens in a new tab)</span>
                  </a>
                  <a href={directory.href} download className="text-[#80651d] underline underline-offset-4 hover:text-black">
                    Download PDF <span className="sr-only">— {directory.title}</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-lines-heading" className="mt-14">
          <h2 id="recent-lines-heading" className="text-3xl font-semibold">Recent lines</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-gray-700">
            Updated rosters and photographs for the 206th through 212th Lines,
            supplied by Terrence J. Boyle on November 13, 2026.
          </p>
          <nav aria-label="Jump to a recent line" className="my-6 flex flex-wrap gap-x-5 gap-y-3">
            {recentLines.map((line) => (
              <a key={line.number} href={`#line-${line.number}`} className="text-[#80651d] underline underline-offset-4 hover:text-black">
                {line.number}th Line
              </a>
            ))}
          </nav>
          <div className="space-y-12">
            {recentLines.map((line) => (
              <section key={line.number} id={`line-${line.number}`} aria-labelledby={`line-${line.number}-heading`} className="scroll-mt-32 border-t border-[#d4af36]/40 pt-8">
                <div className="mb-6">
                  <h3 id={`line-${line.number}-heading`} className="text-3xl font-semibold">{line.number}th Line</h3>
                  <p className="mt-2 text-gray-600">{line.season} {line.year} · {line.count} {line.count === 1 ? 'initiate' : 'initiates'}</p>
                </div>
                <div className="grid items-start gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <ul className="space-y-3 text-lg leading-relaxed text-gray-800">
                    {line.members.map((name) => <li key={name} className="break-words"><bdi>{name}</bdi></li>)}
                  </ul>
                  <figure>
                    <a href={line.photo.src} target="_blank" rel="noopener noreferrer" aria-label={`View the ${line.number}th Line photograph in a new tab`}>
                      <Image src={line.photo.src} alt={`Photograph accompanying the ${line.number}th Line roster`} width={line.photo.width} height={line.photo.height} sizes="(min-width: 768px) 440px, 100vw" className="h-auto w-full rounded-sm" />
                    </a>
                    <figcaption className="mt-3 text-sm text-gray-600">{line.number}th Line · {line.season} {line.year}</figcaption>
                  </figure>
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  )
}
