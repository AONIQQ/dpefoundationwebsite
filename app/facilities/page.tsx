'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X } from 'lucide-react'
import { Button } from "@/app/components/ui/button"

export default function Facilities() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
            <Link href="/" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Home
            </Link>
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
          <div className="md:hidden mt-4 bg-white dark:bg-black py-2 px-4 absolute top-full left-0 right-0 shadow-md">
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

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center text-black dark:text-white">Facilities</h1>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">House Management Committee</h2>
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          
          {/* Member grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Joseph Picozzi</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Interim Chair</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">State Senator</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Michael &quot;Duke&quot; Eriksen</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Attorney</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Vincent Chiarello</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Real Estate</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Nash Peart</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Contractor</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
              <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">Harsh Thacker</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Member</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Alpha Chapter</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Real Estate</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg text-base sm:text-lg space-y-6 text-center">
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
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Property Acquisition</h4>
                  <p className="text-gray-700 dark:text-gray-300">Identifying and evaluating potential headquarters facilities that align with the Foundation&apos;s mission and requirements.</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Project Management</h4>
                  <p className="text-gray-700 dark:text-gray-300">Overseeing the acquisition process, including negotiations, due diligence, and closing procedures.</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Property Management</h4>
                  <p className="text-gray-700 dark:text-gray-300">Managing and maintaining Foundation properties to ensure they serve the organization&apos;s educational mission.</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#d4af36] mb-2">Strategic Planning</h4>
                  <p className="text-gray-700 dark:text-gray-300">Developing long-term facility strategies in accordance with the Alpha House Fund Plan and Foundation objectives.</p>
                </div>
              </div>
            </div>
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
