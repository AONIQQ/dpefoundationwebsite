'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { CampaignsTab } from './CampaignsTab'
import { ContactsTab } from './ContactsTab'
import { SetupTab } from './SetupTab'
import { type Overview, api } from './shared'

const TAB = 'px-4 py-2 rounded-md border border-[#d4af36]/50 bg-[#fdfcf9] text-[#b08d28] font-semibold data-[state=active]:bg-[#d4af36] data-[state=active]:text-white'

export default function EmailAdmin() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [tab, setTab] = useState('campaigns')

  const refresh = useCallback(async () => {
    const data = await api<Overview>('/api/admin/email/overview')
    if (data) setOverview(data)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const failing = overview?.checks.filter((c) => !c.ok).length ?? 0

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <ToastContainer />
      <header className="bg-white/95 py-4 sticky top-0 z-10 shadow-sm border-b border-[#d4af36]/20">
        <div className="container mx-auto px-4 flex justify-between items-center gap-4">
          <Link href="/"><Image src="/DPE.png" alt="Delta Phi Epsilon logo" width={240} height={60} className="h-12 w-auto" /></Link>
          <Link href="/admin"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Applications</Button></Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <h1 className="text-2xl font-serif text-[#1f2a44]">Fundraising email</h1>
          {overview && (
            <p className="text-sm text-gray-600">
              {overview.sent24h} of {overview.settings.daily_cap} sent in the last 24 hours · {overview.queued} waiting
              {overview.settings.paused && <span className="ml-2 font-semibold text-amber-700">· All sending paused</span>}
            </p>
          )}
        </div>

        {!overview ? <p className="text-gray-600">Loading…</p> : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap gap-2 h-auto p-0 bg-transparent justify-start">
              <TabsTrigger value="campaigns" className={TAB}>Campaigns</TabsTrigger>
              <TabsTrigger value="contacts" className={TAB}>Contacts &amp; lists</TabsTrigger>
              <TabsTrigger value="setup" className={TAB}>
                Setup &amp; settings{failing > 0 && <span className="ml-2 rounded-full bg-red-600 text-white text-xs px-2">{failing}</span>}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="campaigns"><CampaignsTab overview={overview} refresh={refresh} /></TabsContent>
            <TabsContent value="contacts"><ContactsTab lists={overview.lists} refresh={refresh} /></TabsContent>
            <TabsContent value="setup"><SetupTab overview={overview} refresh={refresh} /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
