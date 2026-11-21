import SectionPage from '@/app/components/SectionPage'
import { PhotoGroup } from '@/app/components/HistoryPhoto'
import { FRATERNITY_HISTORY } from '@/content/fraternity/history'
import { HISTORY_PHOTOS } from '@/content/fraternity/photos'

export default function FraternityHistoryPage() {
  const [lead, ...rest] = FRATERNITY_HISTORY
  const photosAfter = (i: number) => HISTORY_PHOTOS.filter((p) => p.after === i)
  return (
    <SectionPage href="/fraternity/history" title="Fraternity History" intro={<p>{lead}</p>}>
      <article className="mx-auto max-w-3xl text-[17px] leading-relaxed text-gray-800">
        <PhotoGroup photos={photosAfter(0)} />
        {rest.map((p, i) => (
          <div key={i}>
            <p className="mt-5">{p}</p>
            <PhotoGroup photos={photosAfter(i + 1)} />
          </div>
        ))}
      </article>
    </SectionPage>
  )
}
