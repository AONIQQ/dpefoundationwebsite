'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import AnimatedSection from '@/app/components/AnimatedSection'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

const ROMAN = ['I', 'II', 'III']

const PURPOSE = [
  { title: "Empower Future Leaders", content: "Equip students with the necessary knowledge, skills, and experiences to excel in careers related to foreign service, international relations, and international commerce while cultivating critical thinking, leadership, and a deep understanding of global issues." },
  { title: "Enhance International Understanding", content: "Promote mutual understanding and cooperation among nations through education and cultural exchange. We strive to foster peaceful, productive relationships." },
  { title: "Foster Diplomatic Skills", content: "Improve the capabilities of individuals and institutions involved in foreign service, international relations and international commerce through targeted educational initiatives." },
]

const MISSION = [
  { title: "Provide Scholarships and Financial Aid", content: "The foundation aims to offer scholarships and other financial assistance to individuals studying foreign service, international relations and international commerce, helping them to achieve their academic and professional goals." },
  { title: "Promote Academic Excellence", content: "By supporting students and educational programs, the foundation seeks to foster a high standard of academic achievement in the fields of foreign service, international relations, and international commerce." },
  { title: "Support Practical Experience", content: "The foundation encourages and facilitates internships, fellowships, and other opportunities that provide practical experience in diplomacy, international affairs, and international commerce." },
]

function PillarCard({ heading, items }: { heading: string; items: { title: string; content: string }[] }) {
  return (
    <div className="bg-[#fdfcf9] p-6 sm:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]">
      <h3 className="text-2xl sm:text-3xl font-bold text-[#b08d28] text-center">{heading}</h3>
      <div className="w-16 h-px bg-[#d4af36]/40 mx-auto mt-4 mb-2" />
      <ul className="divide-y divide-[#d4af36]/15">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-4 sm:gap-5 py-5 first:pt-6 last:pb-1">
            <span className="shrink-0 w-7 text-center text-xl sm:text-2xl italic text-[#b08d28] leading-tight">
              {ROMAN[index]}
            </span>
            <div>
              <h4 className="text-lg sm:text-xl font-semibold mb-1.5 text-black">{item.title}</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />

      <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,54,0.06)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <Image
              src="/DPE.png"
              alt=""
              aria-hidden="true"
              width={480}
              height={120}
              priority
              className="mx-auto h-24 sm:h-32 md:h-40 w-auto"
            />
            {/* The logo artwork already reads the foundation name, so the heading is
                visually hidden but kept as a real <h1> for SEO / screen readers. */}
            <h1 className="sr-only">Delta Phi Epsilon Foundation — For Foreign Service Education</h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <OrnamentalDivider className="my-8 sm:my-10" />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto italic">
              Promoting the virtues of foreign service and educating the next generation of American global statesmen since 1962
            </p>
          </AnimatedSection>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <section className="mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black text-center">Who We Are</h2>
          <OrnamentalDivider className="mb-6 sm:mb-8" />
          <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed text-center">
            Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education was created to promote the virtues of foreign service and to help educate the next generation of American global statesmen. We organize sophisticated programming and deliver scholarships in pursuit of this mission. The Foundation is managed and operated solely by volunteers. All Trustees, officers and committee members donate their time and receive no compensation or remuneration of any kind.
          </p>
        </section>

        <section className="mb-16 sm:mb-20 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black text-center">Purpose &amp; Mission</h2>
          <OrnamentalDivider className="mb-8 sm:mb-10" />
          <p className="text-lg sm:text-xl text-gray-800 mb-8 sm:mb-12 text-center max-w-4xl mx-auto leading-relaxed">
            The foundation aims to equip the next generation of leaders in foreign service with the skills, knowledge, and support they need to succeed in their careers and contribute to global peace and understanding.
          </p>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <PillarCard heading="Purpose" items={PURPOSE} />
            <PillarCard heading="Mission" items={MISSION} />
          </div>
        </section>

        <section className="mb-16 sm:mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black text-center">About Us</h2>
          <OrnamentalDivider className="mb-8 sm:mb-10" />
          <div className="bg-[#fdfcf9] p-6 sm:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36] text-center">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6">
              To view our certificate of incorporation, learn more about our officers, trustees, and view organizations we are affiliated with, click the button below.
            </p>
            <Link href="/about">
              <Button className="bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white text-base sm:text-lg py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 ease-in-out transform hover:shadow-[0_0_20px_rgba(212,175,54,0.3)]">
                About Us
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
