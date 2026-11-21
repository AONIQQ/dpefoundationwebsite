import SectionPage from '@/app/components/SectionPage'
import Image from 'next/image'
import { NATIONAL_PRESIDENTS } from '@/content/fraternity/national-presidents'
import { PRESIDENT_PORTRAITS } from '@/content/fraternity/photos'

export default function NationalPresidentsPage() {
  return (
    <SectionPage href="/fraternity/national-presidents" title="National Presidents" intro={<p>The National Presidents of Delta Phi Epsilon Foreign Service Fraternity since 1921.</p>}>
      <ol className="mx-auto max-w-3xl divide-y divide-[#d4af36]/30 border-y border-[#d4af36]/30">
        {NATIONAL_PRESIDENTS.map((p, i) => (
          <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-x-5 gap-y-1 py-5 sm:grid-cols-[7rem_1fr]">
            <Image
              src={PRESIDENT_PORTRAITS[i].src}
              width={PRESIDENT_PORTRAITS[i].width}
              height={PRESIDENT_PORTRAITS[i].height}
              alt={p.name}
              sizes="112px"
              className="row-span-2 w-full h-auto rounded-md border border-[#d4af36]/30 bg-white"
            />
            <div className="text-sm font-semibold tabular-nums text-[#80651d]">{p.terms.join(', ')}</div>
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
