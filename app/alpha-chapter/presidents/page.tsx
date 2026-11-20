import SectionPage from '@/app/components/SectionPage'
import { ALPHA_PRESIDENTS } from '@/content/fraternity/alpha-presidents'

export default function AlphaPresidentsPage() {
  return (
    <SectionPage href="/alpha-chapter/presidents" title="Presidents of Alpha Chapter" intro={<p>Every president of Alpha Chapter since the Fraternity’s founding in 1920, with the date each was initiated and the term served.</p>}>
      <div className="overflow-x-auto rounded-xl border border-[#d4af36]/40 bg-white shadow-sm">
        <table className="w-full min-w-[34rem] text-left text-[15px]">
          <thead className="bg-[#faf8f5] text-sm text-gray-600">
            <tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Initiated</th><th className="px-4 py-3 font-semibold">Term</th><th className="px-4 py-3 font-semibold"><span className="sr-only">Died</span></th></tr>
          </thead>
          <tbody className="divide-y divide-[#d4af36]/20">
            {ALPHA_PRESIDENTS.map((p, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-black">{p.name || <span className="italic text-gray-400">Name not recorded</span>}</td>
                <td className="px-4 py-2 tabular-nums text-gray-700">{p.initiated}</td>
                <td className="px-4 py-2 tabular-nums text-gray-700">{p.term}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{p.died}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  )
}
