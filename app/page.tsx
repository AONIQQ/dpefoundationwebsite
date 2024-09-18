'use client'

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X, Users, Globe, BookOpen, GraduationCap, Award, Briefcase } from 'lucide-react'
import { Button } from "@/app/components/ui/button"

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
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-serif">
      <header className="bg-white dark:bg-black py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-16 w-auto sm:h-18 md:h-18"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/scholarship-application" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarship Application
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
          <div ref={mobileMenuRef} className="md:hidden mt-4 bg-white dark:bg-black py-2 px-4 absolute top-full left-0 right-0 shadow-md">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-[#d4af36]" />
              </Button>
            </div>
            <Link href="/scholarship-application" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarship Application
            </Link>
            <Link href="/contact" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Contact Us
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-left py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg"
            >
              {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Who We Are</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed text-center">
            Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education was created to promote the virtues of foreign service and to help educate the next generation of American global statesmen. We organize sophisticated programming and deliver scholarships in pursuit of this mission.
          </p>
        </section>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Kenneth W Bleakley Foreign Service Officer Scholarships</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <div className="bg-gray-100 dark:bg-black p-8 rounded-lg shadow-lg border-2 border-transparent dark:border-white">
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              Kenneth W Bleakley had a distinguished 29-year career as a U.S. Foreign Service Officer included serving as President George H.W. Bush&apos;s Senior Deputy U.S. Coordinator for International Communications and Information Policy, Deputy Chief of Mission in San Salvador, Director of U.S. Operations in Central America and Director of the U.S. International Refugee Program. He was President of the American Foreign Service Association and Delta Phi Epsilon Professional Foreign Service Fraternity.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed">
              After retiring from the Foreign Service he was a founder and past president of Fonemed LLC, which provides nurse advice services throughout North America and the Caribbean. He graduated from Georgetown&apos;s School of Foreign Service and held a Master&apos;s Degree from American University. An avid skier, poker player and boatsman, Ken lived a full life of gusto and determination.
            </p>
          </div>
        </section>

        <section className="mb-20 bg-[#d4af36] dark:bg-black rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center text-black dark:text-[#d4af36]">Scholarship Information</h2>
          <div className="w-20 h-1 bg-black dark:bg-[#d4af36] mx-auto mb-6"></div>
          <div className="bg-white dark:bg-black p-6 rounded-lg border-2 border-black dark:border-white">
            <p className="text-lg mb-10 text-center max-w-3xl mx-auto text-black dark:text-white">
              The trustees of the Delta Phi Epsilon Foundation for Foreign Service Education have decided to honor Kenneth W. Bleakley, a Senior Foreign Service Officer, former Trustee of the Foundation and DPE fraternity brother by the establishment of a Scholarship Award Program in his name.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Submission Requirements", content: "Scholarship applicants must submit their names, email addresses, current residence address, phone number, and evidence of current attendance or graduation from degree programs at Georgetown University." },
                { title: "Test Evidence", content: "Scholarship recipients must submit evidence of taking the US Foreign Service Officer Test or good reason for failure to do. Failure to do so will preclude eligibility for further scholarships or grants." },
                { title: "Scholarship Amount", content: "Scholarships in the amount of $250 per recipient will be awarded to Georgetown university degree program students or graduates who apply to take the US Foreign Service Officer Test scheduled for September-October." }
              ].map((item, index) => (
                <div key={index} className="bg-gray-100 dark:bg-black p-6 rounded-lg shadow-md flex flex-col transform transition duration-300 hover:scale-105 border-2 border-black dark:border-white">
                  <h3 className="text-xl font-semibold mb-3 text-[#d4af36]">{item.title}</h3>
                  <p className="text-gray-800 dark:text-white flex-grow">{item.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/scholarship-application">
                <Button className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-lg py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                  Apply For Scholarship
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-20 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Purpose & Mission</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          <p className="text-xl text-gray-800 dark:text-white mb-12 text-center max-w-4xl mx-auto leading-relaxed">
            The foundation aims to equip the next generation of leaders in foreign service with the skills, knowledge, and support they need to succeed in their careers and contribute to global peace and understanding.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl border-2 border-transparent dark:border-white">
              <h3 className="text-3xl font-bold mb-8 text-[#d4af36] text-center">Purpose</h3>
              <ul className="space-y-8">
                {[
                  { icon: Users, title: "Empower Future Leaders", content: "Equip students with the necessary knowledge, skills, and experiences to excel in careers related to foreign service while cultivating critical thinking, leadership, and a deep understanding of global issues." },
                  { icon: Globe, title: "Enhance International Understanding", content: "Promote mutual understanding and cooperation among nations through education and cultural exchange. We strive to foster peaceful, productive relationships." },
                  { icon: BookOpen, title: "Foster Diplomatic Skills", content: "Improve the capabilities of individuals and institutions involved in diplomacy and international relations through targeted educational initiatives." }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <item.icon className="w-8 h-8 text-[#d4af36]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.title}</h4>
                      <p className="text-gray-700 dark:text-white">{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl border-2 border-transparent dark:border-white">
              <h3 className="text-3xl font-bold mb-8 text-[#d4af36] text-center">Mission</h3>
              <ul className="space-y-8">
                {[
                  { icon: GraduationCap, title: "Provide Scholarships and Financial Aid", content: "The foundation aims to offer scholarships and other financial assistance to individuals studying foreign service and international relations, helping them to achieve their academic and professional goals." },
                  { icon: Award, title: "Promote Academic Excellence", content: "By supporting students and educational programs, the foundation seeks to foster a high standard of academic achievement in the field of foreign service." },
                  { icon: Briefcase, title: "Support Practical Experience", content: "The foundation encourages and facilitates internships, fellowships, and other opportunities that provide practical experience in diplomacy and international affairs." }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <item.icon className="w-8 h-8 text-[#d4af36]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.title}</h4>
                      <p className="text-gray-700 dark:text-white">{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Foundation Officers</h2>
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Joseph Picozzi", role: "President", chapter: "Alpha Chapter", line: "" },
              { name: "Carlos Roa", role: "Secretary", chapter: "Alpha Chapter", line: "" },
              { name: "Albert L. Grasso", role: "Treasurer", chapter: "Alpha Chapter", line: "92 Line" },
            ].map((officer, index) => (
              <div key={index} className="bg-white dark:bg-black p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-transparent dark:border-white">
                <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">{officer.name}</h3>
                <p className="text-gray-600 dark:text-white mb-1">{officer.role}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.chapter}</p>
                {officer.line && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.line}</p>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Foundation Trustees</h2>
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Joseph Picozzi", role: "Alpha Chapter", denomination: "", occupation: "Politician" },
              { name: "Carlos Roa", role: "Alpha Chapter", denomination: "", occupation: "" },
              { name: "Albert Grasso", role: "Alpha Chapter", denomination: "92 Line", occupation: "Attorney" },
              { name: "Timothy J. Rosenberger", role: "Alpha Chapter", denomination: "206 Line", occupation: "Attorney" },
              { name: "Michael D. Eriksen", role: "Alpha Chapter", denomination: "99 Line", occupation: "Attorney" },
              { name: "Thomas Stewart", role: "Alpha Chapter", denomination: "", occupation: "" },
            ].map((trustee, index) => (
              <div key={index} className="bg-white dark:bg-black p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-transparent dark:border-white">
                <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">{trustee.name}</h3>
                <p className="text-gray-600 dark:text-white mb-1">{trustee.role}</p>
                {trustee.denomination && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{trustee.denomination}</p>
                )}
                {trustee.occupation && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{trustee.occupation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-[#d4af36]">
            Delta Phi Epsilon Foundation for Foreign Service Education is a 501(c)(3) tax-exempt organization and is not affiliated with Georgetown University, the government of the United States or any of its subdivisions, agencies or departments.
          </p>
          <div className="flex flex-col items-center">
            <Link href="/contact">
              <Button 
                variant="link" 
                className="text-[#d4af36] hover:text-white transition duration-300"
              >
                Contact Us
              </Button>
            </Link>
            <Button 
              variant="link" 
              className="text-[#d4af36] hover:text-white transition duration-300 underline"
              onClick={() => window.open('https://www.aoniqq.com/websitecreation', '_blank')}
            >
              Site by Aoniqq LLC
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}