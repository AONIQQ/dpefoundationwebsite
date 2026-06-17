'use client'

import Link from "next/link"
import Image from "next/image"
import { Users, Globe, BookOpen, GraduationCap, Award, Briefcase } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import AnimatedSection from '@/app/components/AnimatedSection'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1729] transition-colors duration-300 font-serif texture-grain">
      <SiteHeader />

      <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,54,0.06)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            {/* Two logos toggled by the `dark` class so the right one paints before JS runs. */}
            <Image
              src="/DPE.png"
              alt=""
              aria-hidden="true"
              width={480}
              height={120}
              priority
              className="mx-auto h-24 sm:h-32 md:h-40 w-auto dark:hidden"
            />
            <Image
              src="/DPE-inverted.png"
              alt=""
              aria-hidden="true"
              width={480}
              height={120}
              priority
              className="mx-auto h-24 sm:h-32 md:h-40 w-auto hidden dark:block"
            />
            {/* The logo artwork already reads the foundation name, so the heading is
                visually hidden but kept as a real <h1> for SEO / screen readers. */}
            <h1 className="sr-only">Delta Phi Epsilon Foundation — For Foreign Service Education</h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <OrnamentalDivider className="my-8 sm:my-10" />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto italic">
              Promoting the virtues of foreign service and educating the next generation of American global statesmen since 1962
            </p>
          </AnimatedSection>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <section className="mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black dark:text-white text-center">Who We Are</h2>
          <OrnamentalDivider className="mb-6 sm:mb-8" />
          <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed text-center">
            Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education was created to promote the virtues of foreign service and to help educate the next generation of American global statesmen. We organize sophisticated programming and deliver scholarships in pursuit of this mission. The Foundation is managed and operated solely by volunteers. All Trustees, officers and committee members donate their time and receive no compensation or remuneration of any kind.
          </p>
        </section>

        <section className="mb-16 sm:mb-20 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black dark:text-white text-center">Purpose & Mission</h2>
          <OrnamentalDivider className="mb-8 sm:mb-10" />
          <p className="text-lg sm:text-xl text-gray-800 dark:text-white mb-8 sm:mb-12 text-center max-w-4xl mx-auto leading-relaxed">
            The foundation aims to equip the next generation of leaders in foreign service with the skills, knowledge, and support they need to succeed in their careers and contribute to global peace and understanding.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 sm:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-[#d4af36] text-center">Purpose</h3>
              <ul className="space-y-6 sm:space-y-8">
                {[
                  { icon: Users, title: "Empower Future Leaders", content: "Equip students with the necessary knowledge, skills, and experiences to excel in careers related to foreign service, international relations, and international commerce while cultivating critical thinking, leadership, and a deep understanding of global issues." },
                  { icon: Globe, title: "Enhance International Understanding", content: "Promote mutual understanding and cooperation among nations through education and cultural exchange. We strive to foster peaceful, productive relationships." },
                  { icon: BookOpen, title: "Foster Diplomatic Skills", content: "Improve the capabilities of individuals and institutions involved in foreign service, international relations and international commerce through targeted educational initiatives." }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af36]" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold mb-2 text-black dark:text-white">{item.title}</h4>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-white">{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 sm:p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-[#d4af36] text-center">Mission</h3>
              <ul className="space-y-6 sm:space-y-8">
                {[
                  { icon: GraduationCap, title: "Provide Scholarships and Financial Aid", content: "The foundation aims to offer scholarships and other financial assistance to individuals studying foreign service, international relations and international commerce, helping them to achieve their academic and professional goals." },
                  { icon: Award, title: "Promote Academic Excellence", content: "By supporting students and educational programs, the foundation seeks to foster a high standard of academic achievement in the fields of foreign service, international relations, and international commerce." },
                  { icon: Briefcase, title: "Support Practical Experience", content: "The foundation encourages and facilitates internships, fellowships, and other opportunities that provide practical experience in diplomacy, international affairs, and international commerce." }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af36]" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold mb-2 text-black dark:text-white">{item.title}</h4>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-white">{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16 sm:mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black dark:text-white text-center">About Us</h2>
          <OrnamentalDivider className="mb-8 sm:mb-10" />
          <div className="bg-[#fdfcf9] dark:bg-[#131d33] p-4 sm:p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36] text-center">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white mb-6">
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