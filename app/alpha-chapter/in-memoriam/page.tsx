import SectionPage from '@/app/components/SectionPage'
import MemoriamList from './MemoriamList'

export default function InMemoriamPage() {
  return (
    <SectionPage
      href="/alpha-chapter/in-memoriam"
      title="In Memoriam - Absent Brothers"
      source={false}
      intro={
        <p className="text-xl italic">
          “To our absent brothers,
          <br />
          May we ne’er forget them”
        </p>
      }
    >
      <MemoriamList />
    </SectionPage>
  )
}
