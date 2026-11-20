import SectionPage from '@/app/components/SectionPage'
import { FRATERNITY_HISTORY } from '@/content/fraternity/history'

export default function FraternityHistoryPage() {
  const [lead, ...rest] = FRATERNITY_HISTORY
  return (
    <SectionPage href="/fraternity/history" title="Fraternity History" intro={<p>{lead}</p>}>
      <article className="mx-auto max-w-3xl space-y-5 text-[17px] leading-relaxed text-gray-800">
        {rest.map((p, i) => <p key={i}>{p}</p>)}
      </article>
    </SectionPage>
  )
}
