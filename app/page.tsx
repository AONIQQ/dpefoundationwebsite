'use client'

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X, Users, Globe, BookOpen, GraduationCap, Award, Briefcase } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import AnimatedSection from '@/app/components/AnimatedSection'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !(mobileMenuRef.current as Node).contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1729] transition-colors duration-300 font-serif texture-grain">
      <header className="bg-white/80 dark:bg-[#0f1729]/80 backdrop-blur-md py-4 sticky top-0 z-50 shadow-sm border-b border-[#d4af36]/20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-12 w-auto sm:h-14 md:h-16"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Programs
            </Link>
            <Link href="/facilities" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Facilities
            </Link>
            <Link href="/scholarships" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarships
            </Link>
            <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Policies
            </Link>
            <Link href="/contact" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Contact Us
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </nav>
          <Button 
            variant="ghost" 
            className="md:hidden text-[#d4af36]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden mt-4 bg-white/95 dark:bg-[#0f1729]/95 backdrop-blur-sm py-2 px-4 absolute top-full left-0 right-0 shadow-md">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-[#d4af36]" />
              </Button>
            </div>
            <Link href="/about" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              About Us
            </Link>
            <Link href="/programs" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Programs
            </Link>
            <Link href="/facilities" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Facilities
            </Link>
            <Link href="/scholarships" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Scholarships
            </Link>
            <Link href="/policies" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Policies
            </Link>
            <Link href="/contact" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Contact Us
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-center py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg"
            >
              {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        )}
      </header>

      <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,54,0.06)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <Image
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"}
              alt="Delta Phi Epsilon Crest"
              width={480}
              height={120}
              className="mx-auto h-24 sm:h-32 md:h-40 w-auto mb-8 sm:mb-10"
              priority
            />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-4 sm:mb-6 tracking-tight">
              Delta Phi Epsilon Foundation
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p className="text-lg sm:text-xl md:text-2xl text-[#d4af36] font-medium tracking-wide">
              For Foreign Service Education
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <OrnamentalDivider className="my-8 sm:my-10" />
          </AnimatedSection>
          <AnimatedSection delay={0.5}>
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
            <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-transparent dark:border-white">
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
            
            <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-transparent dark:border-white">
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
          <div className="bg-white dark:bg-black p-4 sm:p-6 rounded-lg shadow-lg border-2 border-transparent dark:border-white text-center">
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

      <footer className="bg-[#0a0e1a] text-white pt-16 pb-8 border-t border-[#d4af36]/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="text-center md:text-left">
              <Image
                src="/DPE-inverted.png"
                alt="Delta Phi Epsilon"
                width={200}
                height={50}
                className="h-12 w-auto mx-auto md:mx-0 mb-4 opacity-60"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-[#d4af36] font-semibold text-lg mb-4 tracking-wide">Quick Links</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/about" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">About Us</Link>
                <Link href="/programs" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">Programs</Link>
                <Link href="/scholarships" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">Scholarships</Link>
                <Link href="/facilities" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">Facilities</Link>
                <Link href="/policies" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">Policies</Link>
                <Link href="/contact" className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm">Contact</Link>
              </nav>
            </div>
            <div className="text-center md:text-right">
              <h4 className="text-[#d4af36] font-semibold text-lg mb-4 tracking-wide">Contact</h4>
              <p className="text-gray-400 text-sm mb-2">Georgetown Court</p>
              <p className="text-gray-400 text-sm mb-4">3222 N Street NW, Washington DC 20007</p>
              <Link href="/contact" className="text-[#d4af36] hover:text-[#e8d48b] transition duration-300 text-sm font-medium">
                Send us a message &rarr;
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-500 text-center mb-4">
              Delta Phi Epsilon Foundation for Foreign Service Education is a 501(c)(3) tax-exempt organization and is not affiliated with Georgetown University, the government of the United States or any of its subdivisions, agencies or departments.
            </p>
            <div className="text-center">
              <Button
                variant="link"
                className="text-gray-600 hover:text-gray-400 transition duration-300 text-xs"
                onClick={() => window.open('https://www.aoniqq.com/websitecreation', '_blank')}
              >
                Site by Aoniqq LLC
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}