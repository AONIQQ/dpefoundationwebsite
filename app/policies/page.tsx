'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X, FileText } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'

export default function PoliciesPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePolicy, setActivePolicy] = useState<string | null>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const policies = [
    { title: "Conflict of Interest Policy", file: "/DPE_Conflict_of_Interest_Policy.pdf" },
    { title: "Document Retention Policy", file: "/DPE_Document_Retention_Policy.pdf" },
    { title: "Investment Policy Statement", file: "/DPE_Investment_Policy.pdf" },
    { 
      title: "IRS Tax Exemption Letters", 
      files: [
        { name: "IRS Tax Exemption Letter 1", file: "/DPE_IRS_Tax_Exemption_Letter.pdf" },
        { name: "IRS Tax Exemption Letter 2", file: "/IRS_Letter.pdf" }
      ]
    },
    { 
      title: "Scholarship Guidelines and Procedures", 
      files: [
        { name: "General Scholarship Guidelines", file: "/Scholarship_Guidelines.pdf" },
        { name: "Bleakley Scholarship Guidelines and Procedures", file: "/Bleakley_Scholarship_Guidelines_and_Procedures.pdf" },
      ]
    },

   

   
    { title: "Bylaws", file: "/1983_Bylaws.pdf" },
    { title: "IRS Revenue Ruling 56-304", file: "/304.pdf" },
    { title: "IRS Revenue Ruling 56-403", file: "/403.pdf" },
    { title: "General Committee Guidelines", file: "/General_Committee_Guidelines.pdf" },
    { title: "Alpha House Fund Plan", file: "/Alpha_House_Fund_Plan.pdf" }
  ]

   

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] dark:from-[#0f1729] dark:to-[#0c1322] texture-grain transition-colors duration-300 font-serif">
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
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Programs
            </Link>
            <Link href="/facilities" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Facilities
            </Link>
            <Link href="/scholarships" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarships
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
            <Link href="/programs" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Programs
            </Link>
            <Link href="/facilities" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Facilities
            </Link>
            <Link href="/scholarships" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
              Scholarships
            </Link>
            <Link href="/contact" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg text-center">
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

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 text-black dark:text-white text-center"
        >
          Foundation Policies
        </motion.h1>
        <OrnamentalDivider className="mb-12 sm:mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-[#fdfcf9] dark:bg-[#131d33] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden border-t-2 border-[#d4af36] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_4px_25px_-3px_rgba(212,175,54,0.15),0_15px_30px_-2px_rgba(0,0,0,0.06)]">
                <div className="p-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#d4af36] mb-4 break-words hyphens-auto">
                    {policy.title}
                  </h2>
                  {Array.isArray(policy.files) ? (
                    <div className="flex flex-col space-y-2">
                      {policy.files.map((file, fileIndex) => (
                        <Button 
                          key={fileIndex}
                          className="w-full bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white transition-colors duration-300"
                          onClick={() => setActivePolicy(file.file)}
                        >
                          <FileText className="mr-2 h-5 w-5" />
                          {file.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white transition-colors duration-300"
                      onClick={() => setActivePolicy(policy.file || null)} // Provide default value
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      View Policy
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {activePolicy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#fdfcf9] dark:bg-[#131d33] p-6 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af36]">Policy Viewer</h2>
                  <Button onClick={() => setActivePolicy(null)} variant="ghost" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <iframe 
                    src={`${activePolicy}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title="Policy PDF Viewer"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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