'use client'

import { useMemo, useState } from 'react'
import brothers from '@/content/alpha-lineage-memoriam.json'

interface Brother { line: string; name: string; born: string; died: string }

const ALL = brothers as Brother[]

// Deceased brothers of Alpha Chapter with birth and death dates, searchable by
// name or line. Only deceased brothers appear: living brothers' birth dates
// are deliberately not published.
export default function MemoriamList() {
  const [q, setQ] = useState('')
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? ALL.filter((b) => `${b.name} ${b.line}`.toLowerCase().includes(t)) : ALL
  }, [q])

  return (
    <div>
      <p className="max-w-3xl leading-relaxed text-gray-700">
        Deceased brothers of Alpha Chapter, with their dates of birth and death where known. Corrections and missing
        dates are welcome at <a href="mailto:info@dpefoundation.org" className="text-[#80651d] underline">info@dpefoundation.org</a>.
      </p>
      <label className="mt-6 block max-w-md">
        <span className="sr-only">Search by name or line</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or line, e.g. 62nd"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#d4af36]"
        />
      </label>
      <p className="mt-2 text-sm text-gray-500" aria-live="polite">{shown.length} of {ALL.length} brothers</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#d4af36]/40 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left text-[15px]">
          <thead className="bg-[#faf8f5] text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Line</th>
              <th className="px-4 py-3 font-semibold">Born</th>
              <th className="px-4 py-3 font-semibold">Died</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af36]/20">
            {shown.map((b, i) => (
              <tr key={`${b.line}-${b.name}-${i}`}>
                <td className="px-4 py-2 text-black">{b.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700">{b.line}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700">{b.born}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700">{b.died}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
