import SectionPage from '@/app/components/SectionPage'
import { ARTICLES_OF_AGREEMENT as A } from '@/content/fraternity/history'

export default function ArticlesPage() {
  return (
    <SectionPage
      href="/fraternity/articles-of-agreement"
      title="Articles of Agreement"
      intro={<p>Signed by eleven students of the Georgetown University School of Foreign Service on January 11, 1920, two weeks before the Fraternity was formally founded.</p>}
    >
      <article className="mx-auto max-w-3xl rounded-xl border border-[#d4af36]/40 bg-white p-6 sm:p-10 text-[17px] leading-relaxed text-gray-800 shadow-sm">
        <p>{A.preamble}</p>
        <ol className="mt-6 list-decimal space-y-4 pl-6 marker:text-[#80651d]">
          {A.articles.map((a, i) => <li key={i}>{a}</li>)}
        </ol>
        <p className="mt-6">{A.witness}</p>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 italic text-gray-700">
          {A.signatories.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </article>
    </SectionPage>
  )
}
