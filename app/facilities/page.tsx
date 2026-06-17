'use client'

import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function Facilities() {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1729] transition-colors duration-300 font-serif texture-grain">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center text-black dark:text-white">Facilities</h1>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">House Management Committee</h2>
          <OrnamentalDivider className="mb-10" />

          {/* Member grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Joseph Picozzi</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Interim Chair</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">State Senator</p>
            </div>
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Michael &quot;Duke&quot; Eriksen</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Attorney</p>
            </div>
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Vincent Chiarello</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Real Estate</p>
            </div>
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Nash Peart</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Contractor</p>
            </div>
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Harsh Thacker</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Real Estate</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-[#f5f0e8] dark:bg-[#131d33] p-6 rounded-lg shadow-lg text-base sm:text-lg space-y-6 text-center">
            <p className="text-gray-800 dark:text-gray-200">
              The House Management Committee is responsible for locating an appropriate headquarters
              facility, assisting in its acquisition, and managing the acquired property. A copy of the
              Alpha House Fund Plan is available on the website.
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              Pending acquisition of a permanent home, the Foundation has temporarily rented office space
              at Georgetown Court, 3222 N Street NW, Washington DC 20007.
            </p>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Committee Responsibilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-[#fdfcf9] dark:bg-[#1a2540] p-4 rounded-lg border border-[#d4af36]/10">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Property Acquisition</h4>
                  <p className="text-gray-700 dark:text-gray-300">Identifying and evaluating potential headquarters facilities that align with the Foundation&apos;s mission and requirements.</p>
                </div>
                <div className="bg-[#fdfcf9] dark:bg-[#1a2540] p-4 rounded-lg border border-[#d4af36]/10">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Project Management</h4>
                  <p className="text-gray-700 dark:text-gray-300">Overseeing the acquisition process, including negotiations, due diligence, and closing procedures.</p>
                </div>
                <div className="bg-[#fdfcf9] dark:bg-[#1a2540] p-4 rounded-lg border border-[#d4af36]/10">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Property Management</h4>
                  <p className="text-gray-700 dark:text-gray-300">Managing and maintaining Foundation properties to ensure they serve the organization&apos;s educational mission.</p>
                </div>
                <div className="bg-[#fdfcf9] dark:bg-[#1a2540] p-4 rounded-lg border border-[#d4af36]/10">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Strategic Planning</h4>
                  <p className="text-gray-700 dark:text-gray-300">Developing long-term facility strategies in accordance with the Alpha House Fund Plan and Foundation objectives.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
