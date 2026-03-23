'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import OrnamentalDivider from '@/app/components/OrnamentalDivider'

export default function Programs() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
            <Link href="/" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Home
            </Link>
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
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
          <div className="md:hidden mt-4 bg-white/95 dark:bg-[#0f1729]/95 backdrop-blur-sm py-2 px-4 absolute top-full left-0 right-0 shadow-md">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-[#d4af36]" />
              </Button>
            </div>
            <Link href="/" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Home
            </Link>
            <Link href="/about" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              About Us
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

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center text-black dark:text-white">Programs</h1>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Program Committee</h2>
          <OrnamentalDivider className="mb-10" />
          <div className="grid grid-cols-2 gap-8">
            {[
             { name: "Thomas M. Stewart", role: "Chairman", chapter: "Alpha Chapter", occupation: "Economist" },
             { name: "Timothy J. Rosenberger", role: "Member", chapter: "Alpha Chapter", occupation: "Fellow at Stanford University" },
            
            ].map((officer, index) => (
              <div key={index} className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center transform transition-all duration-500 ease-out hover:-translate-y-1 border-t-2 border-[#d4af36]">
                <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">{officer.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-1">{officer.role}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.chapter}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.occupation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-[#f5f0e8] dark:bg-[#131d33] p-6 rounded-lg shadow-lg text-base sm:text-lg space-y-6 text-center">
            <p className="text-gray-800 dark:text-gray-200">
              The Foundation sponsors education programs directed primarily at the Georgetown University student and faculty community but open to all who share an interest in topics relating to Foreign Service and the purposes of the Foundation. No charge is imposed from attendance at any of the events.
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-6">
              Examples of the programs offered in the past include:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {programs.map((program, index) => (
                <div key={index} className="bg-[#fdfcf9] dark:bg-[#131d33] rounded-lg shadow-md overflow-hidden flex flex-col h-80 w-full">
                  <h3 className="text-lg font-bold text-center text-gray-800 dark:text-gray-200 px-4 py-3 bg-gray-200 dark:bg-gray-600">{program.title}</h3>
                  <div className="relative flex-grow">
                    <Image
                      src={`/${program.image}`}
                      alt={program.title}
                      layout="fill"
                      objectFit="contain"
                      className="p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 space-y-4 text-gray-800 dark:text-gray-200">
              <p>
                Programs ceased during the Covid-19 pandemic due to restrictions on public gatherings.
              </p>
              <p>
                Plans are underway to resume programming in the near future. Future lectures will be announced and listed on this website and by advertisement in the Georgetown University student newspaper.
              </p>
            </div>
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