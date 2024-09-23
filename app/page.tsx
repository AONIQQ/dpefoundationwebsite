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
              className="h-12 w-auto sm:h-14 md:h-16"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
            </Link>
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
            <Link href="/about" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              About Us
            </Link>
            <Link href="/scholarship-application" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Scholarship Application
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

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <section className="mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black dark:text-white text-center">Who We Are</h2>
          <div className="w-24 sm:w-32 h-1 bg-[#d4af36] mx-auto mb-6 sm:mb-8"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed text-center">
            Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education was created to promote the virtues of foreign service and to help educate the next generation of American global statesmen. We organize sophisticated programming and deliver scholarships in pursuit of this mission.
          </p>
        </section>

        <section className="mb-16 sm:mb-20 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black dark:text-white text-center">Purpose & Mission</h2>
          <div className="w-24 sm:w-32 h-1 bg-[#d4af36] mx-auto mb-8 sm:mb-10"></div>
          <p className="text-lg sm:text-xl text-gray-800 dark:text-white mb-8 sm:mb-12 text-center max-w-4xl mx-auto leading-relaxed">
            The foundation aims to equip the next generation of leaders in foreign service with the skills, knowledge, and support they need to succeed in their careers and contribute to global peace and understanding.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-transparent dark:border-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-[#d4af36] text-center">Purpose</h3>
              <ul className="space-y-6 sm:space-y-8">
                {[
                  { icon: Users, title: "Empower Future Leaders", content: "Equip students with the necessary knowledge, skills, and experiences to excel in careers related to foreign service while cultivating critical thinking, leadership, and a deep understanding of global issues." },
                  { icon: Globe, title: "Enhance International Understanding", content: "Promote mutual understanding and cooperation among nations through education and cultural exchange. We strive to foster peaceful, productive relationships." },
                  { icon: BookOpen, title: "Foster Diplomatic Skills", content: "Improve the capabilities of individuals and institutions involved in diplomacy and international relations through targeted educational initiatives." }
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
                  { icon: GraduationCap, title: "Provide Scholarships and Financial Aid", content: "The foundation aims to offer scholarships and other financial assistance to individuals studying foreign service and international relations, helping them to achieve their academic and professional goals." },
                  { icon: Award, title: "Promote Academic Excellence", content: "By supporting students and educational programs, the foundation seeks to foster a high standard of academic achievement in the field of foreign service." },
                  { icon: Briefcase, title: "Support Practical Experience", content: "The foundation encourages and facilitates internships, fellowships, and other opportunities that provide practical experience in diplomacy and international affairs." }
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
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-8 sm:mb-10"></div>
          <div className="bg-white dark:bg-black p-4 sm:p-6 rounded-lg shadow-lg border-2 border-transparent dark:border-white text-center">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white mb-6">
              To view our certificate of incorporation, learn more about our officers, trustees, and view organizations we are affiliated with, click the button below.
            </p>
            <Link href="/about">
              <Button className="bg-[#d4af36] hover:bg-[#b08d28] text-white text-base sm:text-lg py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                About Us
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 sm:mb-6 text-[#d4af36] text-sm sm:text-base">
            Delta Phi Epsilon Foundation for Foreign Service Education is a 501(c)(3) tax-exempt organization and is not affiliated with Georgetown University, the government of the United States or any of its subdivisions, agencies or departments.
          </p>
          <div className="flex flex-col items-center">
            <Link href="/contact">
              <Button 
                variant="link" 
                className="text-[#d4af36] hover:text-white transition duration-300 text-sm sm:text-base"
              >
                Contact Us
              </Button>
            </Link>
            <Button 
              variant="link" 
              className="text-[#d4af36] hover:text-white transition duration-300 underline text-sm sm:text-base"
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