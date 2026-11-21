import SectionPage from '@/app/components/SectionPage'
import HistoryPhoto from '@/app/components/HistoryPhoto'
import { PICTORIAL_HISTORY } from '@/content/fraternity/photos'

export default function AlphaPictorialHistoryPage() {
  return (
    <SectionPage
      href="/alpha-chapter/history"
      title="Pictorial History"
      intro={
        <p>
          For almost sixty years, the history of Alpha Chapter has been inseparable from the history of the Alpha
          House at 3401 Prospect Street. This section presents the beginnings of a projected illustrated history of
          Alpha Chapter and its Alpha House, from 1940, when the active Chapter first moved into the building.
        </p>
      }
    >
      <div className="mx-auto grid max-w-4xl gap-x-8 gap-y-12 sm:grid-cols-2">
        {PICTORIAL_HISTORY.map((p, i) => (
          <div key={p.src} className={p.width > 1000 ? 'sm:col-span-2 flex justify-center' : 'flex justify-center'}>
            <HistoryPhoto photo={p} priority={i < 2} />
          </div>
        ))}
      </div>
    </SectionPage>
  )
}
