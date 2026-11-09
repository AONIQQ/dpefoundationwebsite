import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import recognitionLevels from '@/content/honored-greeks.json'

const populatedLevels = recognitionLevels.filter((level) => level.donors.length > 0)

export default function HonoredGreeksPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black">Honored Greeks</h1>
          <OrnamentalDivider />
          <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
            In recognition of cumulative contributions to the Foundation by or on behalf of brothers, as of September 1, 2026.
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {populatedLevels.map((level) => (
            <section key={level.name} id={level.name.toLowerCase()} aria-labelledby={`${level.name.toLowerCase()}-heading`} className="scroll-mt-32 border-t border-[#d4af36]/40 pt-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-6">
                <h2 id={`${level.name.toLowerCase()}-heading`} className="text-3xl font-semibold text-black">{level.name}</h2>
                <p className="text-gray-600">{level.range}</p>
              </div>
              <ul className="columns-1 sm:columns-2 lg:columns-3 gap-8 text-gray-800 leading-relaxed">
                {level.donors.map((name) => (
                  <li key={name} className="break-inside-avoid pb-2">{name}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
