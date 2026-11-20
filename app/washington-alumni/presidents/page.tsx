import SectionPage from '@/app/components/SectionPage'
import { WAA_PRESIDENTS } from '@/content/fraternity/waa-presidents'

export default function WaaPresidentsPage() {
  return (
    <SectionPage href="/washington-alumni/presidents" title="Presidents of the Washington Alumni Association" intro={<p>Presidents of the Washington Alumni Association of Delta Phi Epsilon since its founding in 1929, with each brother’s chapter and year of initiation.</p>}>
      <div className="overflow-x-auto rounded-xl border border-[#d4af36]/40 bg-white shadow-sm">
        <table className="w-full min-w-[30rem] text-left text-[15px]">
          <thead className="bg-[#faf8f5] text-sm text-gray-600">
            <tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Chapter</th><th className="px-4 py-3 font-semibold">Term</th><th className="px-4 py-3 font-semibold">Address</th></tr>
          </thead>
          <tbody className="divide-y divide-[#d4af36]/20">
            {WAA_PRESIDENTS.map((p, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-black">{p.name}</td>
                <td className="px-4 py-2 text-gray-700">{p.chapter}</td>
                <td className="px-4 py-2 tabular-nums text-gray-700">{p.term}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  )
}
