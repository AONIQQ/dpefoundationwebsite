'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X, FileText } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

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
    { 
      title: "IRS Tax Exemption Letters", 
      files: [
        { name: "IRS Tax Exemption Letter 1", file: "/DPE_IRS_Tax_Exemption_Letter.pdf" },
        { name: "IRS Tax Exemption Letter 2", file: "/IRS_Letter.pdf" }
      ]
    },
    { 
      title: "Bleakley Scholarship Guidelines and Procedures", 
      files: [
        { name: "Bleakley Scholarship Guidelines", file: "/Scholarship_Guidelines.pdf" },
        { name: "Bleakley Scholarship Procedures", file: "/Bleakley_Scholarship_Procedures.pdf" },
      ]
    },
    { title: "Bylaws", file: "/1983_Bylaws.pdf" },
    { title: "General Committee Guidelines", file: "/General_Committee_Guidelines.pdf" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-300 font-serif">
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
          <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Home
            </Link>
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Programs
            </Link>
            <Link href="/scholarship-application" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarship Application
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

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 text-black dark:text-white text-center"
        >
          Foundation Policies
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-32 sm:w-40 h-1 bg-[#d4af36] mx-auto mb-12 sm:mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="p-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#d4af36] mb-4 break-words hyphens-auto">
                    {policy.title}
                  </h2>
                  {Array.isArray(policy.files) ? (
                    <div className="flex flex-col space-y-2">
                      {policy.files.map((file, fileIndex) => (
                        <Button 
                          key={fileIndex}
                          className="w-full bg-[#d4af36] hover:bg-[#b08d28] text-white transition-colors duration-300"
                          onClick={() => setActivePolicy(file.file)}
                        >
                          <FileText className="mr-2 h-5 w-5" />
                          {file.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-[#d4af36] hover:bg-[#b08d28] text-white transition-colors duration-300"
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
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
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