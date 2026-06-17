'use client'

import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function PoliciesPage() {
  const [activePolicy, setActivePolicy] = useState<string | null>(null)

  // Close the PDF viewer on Escape, and lock background scroll while it's open.
  useEffect(() => {
    if (!activePolicy) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePolicy(null)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [activePolicy])

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
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 text-black text-center"
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
              <div className="bg-[#fdfcf9] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden border-t-2 border-[#d4af36] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_4px_25px_-3px_rgba(212,175,54,0.15),0_15px_30px_-2px_rgba(0,0,0,0.06)]">
                <div className="p-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#b08d28] mb-4 break-words hyphens-auto">
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
              onClick={() => setActivePolicy(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Policy viewer"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#fdfcf9] p-6 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#b08d28]">Policy Viewer</h2>
                  <Button onClick={() => setActivePolicy(null)} variant="ghost" aria-label="Close policy viewer" className="text-gray-600 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex-grow bg-gray-100 rounded-lg overflow-hidden">
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

      <SiteFooter />
    </div>
  )
}