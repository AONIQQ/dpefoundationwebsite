'use client'

import Image from "next/image"
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function Programs() {
  const programs = [
    { title: "Azerbaijan Development Today", image: "Azerbaijan_Development_Today.png" },
    { title: "How Pakistan Will Make Trump Pay", image: "How_Pakistan_Will_Make_Trump_Pay.png" },
    { title: "The Need for More Warrior Statesmen", image: "The_Need_for_More_Warrior_Statesmen.png" },
    { title: "The Truth Behind the Grail Legends", image: "The_Truth_Behind_the_Grail_Legends.png" },
    { title: "Morality in the Post-Modern World", image: "Morality_in_the_Post_Modern_World.png" },
    { title: "Hedge Funds & Private Equity", image: "Hedge_Funds_and_Private_Equity.png" },
    { title: "Jobs for Those Who've Learned Arabic", image: "Jobs_for_Those_Who_Learned_Arabic.png" },
    { title: "Trump's Trade Policy", image: "Trump_Trade_Policy.png" },
    { title: "US-Iranian Relations", image: "US_Iranian_Relations.png" },
    { title: "Trump and Davos", image: "Trump_and_Davos.png" },
    { title: "Misunderstanding of Mental Illness in America", image: "Misunderstanding_of_Mental_Illness_in_America.png" },
    { title: "Discourse on the Incels", image: "Discourse_on_the_Incels.png" },
    { title: "What Next for US-China Trade?", image: "What_Next_for_US_China_Trade.png" },
    { title: "How Trump Won", image: "How_Trump_Won.png" },
    { title: "Belarus Today", image: "Belarus_Today.png" }
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center text-black">Programs</h1>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black text-center">Program Committee</h2>
          <OrnamentalDivider className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { name: "Thomas M. Stewart", role: "Chairman", chapter: "Alpha Chapter", occupation: "Economist" },
              { name: "Timothy J. Rosenberger", role: "Member", chapter: "Alpha Chapter", occupation: "Fellow at Stanford University" },
            ].map((officer, index) => (
              <div key={index} className="bg-[#fdfcf9] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
                <h3 className="text-xl font-semibold mb-2 text-[#b08d28]">{officer.name}</h3>
                <p className="text-gray-600 mb-1">{officer.role}</p>
                <p className="text-gray-600 text-sm">{officer.chapter}</p>
                <p className="text-gray-600 text-sm">{officer.occupation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-[#f5f0e8] p-6 rounded-lg shadow-lg text-base sm:text-lg space-y-6 text-center">
            <p className="text-gray-800">
              The Foundation sponsors education programs directed primarily at the Georgetown University student and faculty community but open to all who share an interest in topics relating to Foreign Service and the purposes of the Foundation. No charge is imposed from attendance at any of the events.
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-8 mb-6">
              Examples of the programs offered in the past include:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {programs.map((program, index) => (
                <div key={index} className="bg-[#fdfcf9] rounded-lg shadow-md overflow-hidden flex flex-col h-80 w-full border border-[#d4af36]/10">
                  <h3 className="text-lg font-bold text-center text-gray-800 px-4 py-3 bg-[#f5f0e8]">{program.title}</h3>
                  <div className="relative flex-grow">
                    <Image
                      src={`/${program.image}`}
                      alt={program.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 space-y-4 text-gray-800">
              <p>
                Programs ceased during the Covid-19 pandemic due to restrictions on public gatherings.
              </p>
              <p>
                Plans are underway both to resume programming and expand its scope to include assistance to Georgetown SFS students to prepare for activities following graduation. For example, the Foundation has sponsored an Excel and Power Point training workshop attended by over 60 SFS students. Future lectures will be announced and listed on this website and by advertisement in the Georgetown University student newspaper.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}