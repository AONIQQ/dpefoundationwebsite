import SectionPage from '@/app/components/SectionPage'
import { NATIONAL_PRESIDENTS } from '@/content/fraternity/national-presidents'

export default function NationalPresidentsPage() {
  return (
    <SectionPage href="/fraternity/national-presidents" title="National Presidents" intro={<p>The National Presidents of Delta Phi Epsilon Foreign Service Fraternity since 1921.</p>}>
      <ol className="mx-auto max-w-3xl divide-y divide-[#d4af36]/30 border-y border-[#d4af36]/30">
        {NATIONAL_PRESIDENTS.map((p, i) => (
          <li key={i} className="grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[8rem_1fr]">
            <div className="text-sm font-semibold tabular-nums text-[#80651d]">
              {p.terms.map((t) => <div key={t}>{t}</div>)}
            </div>
            <div>
              <p className="text-lg font-semibold text-black">{p.name} <span className="font-normal text-gray-600">{p.chapter}</span></p>
              <p className="mt-1 leading-relaxed text-gray-700">{p.bio}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionPage>
  )
}
