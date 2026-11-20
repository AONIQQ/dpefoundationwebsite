import SectionPage from '@/app/components/SectionPage'
import { WAA_FIRST_YEAR, WAA_FOUNDING as F } from '@/content/fraternity/waa-history'

export default function WaaHistoryPage() {
  return (
    <SectionPage
      href="/washington-alumni/history"
      title="Washington Alumni Association History"
      intro={<p>The Fraternity’s first alumni organization was formed in Washington, D.C., in February 1929. Below are two accounts written at the time: one at its founding, and one after its first year.</p>}
    >
      <article className="mx-auto max-w-3xl text-[17px] leading-relaxed text-gray-800">
        <h2 className="text-2xl font-semibold text-black">{F.headline}</h2>
        <p className="mt-2 italic text-gray-600">{F.dek}</p>
        <div className="mt-6 space-y-5">
          {F.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <blockquote className="space-y-3 border-l-4 border-[#d4af36] bg-white px-6 py-4 italic text-gray-700">
            {F.preamble.map((p, i) => <p key={i}>{p}</p>)}
          </blockquote>
          {F.closing.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <h2 className="mt-12 border-t border-[#d4af36]/40 pt-8 text-2xl font-semibold text-black">After the first year</h2>
        <div className="mt-6 space-y-5">
          {WAA_FIRST_YEAR.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
    </SectionPage>
  )
}
