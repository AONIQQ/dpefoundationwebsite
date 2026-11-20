import SectionPage from '@/app/components/SectionPage'
import { CHAPTERS } from '@/content/fraternity/chapters'

export default function ChapterRollPage() {
  return (
    <SectionPage href="/collegiate-chapters" title="Chapter Roll" intro={<p>The collegiate chapters of Delta Phi Epsilon and the dates they were installed, beginning with Alpha Chapter at Georgetown University in 1920.</p>}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((c) => (
          <li key={c.name} className="rounded-xl border border-[#d4af36]/40 bg-white p-5 shadow-sm">
            <p className="text-xl font-semibold text-black">{c.name} Chapter</p>
            <p className="text-sm tabular-nums text-[#80651d]">Installed {c.installed}</p>
            <p className="mt-3 leading-snug text-gray-800">{c.university}</p>
            {c.school && <p className="text-sm text-gray-600">{c.school}</p>}
            <p className="text-sm text-gray-600">{c.location}</p>
          </li>
        ))}
      </ul>
    </SectionPage>
  )
}
