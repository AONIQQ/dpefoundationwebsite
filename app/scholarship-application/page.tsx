'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Menu, X } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type FileState = {
  application: File | null;
  proof: File | null;
  fsot: File | null;
}

function FileUpload({ label, id, name, onFileChange }: { label: string; id: string; name: string; onFileChange: (file: File | null) => void }) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFileName(file.name)
      onFileChange(file)
      setError(null)
    }
  }, [onFileChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  })

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-[#d4af36] transition-all duration-300 hover:shadow-xl">
      <Label htmlFor={id} className="text-lg font-semibold text-black dark:text-white mb-2 block">
        {label} <span className="text-red-500">*</span>
      </Label>
      <div 
        {...getRootProps()} 
        className={`mt-2 border-2 border-dashed border-[#d4af36] rounded-md p-4 text-center cursor-pointer transition-colors duration-300 ${
          isDragActive ? 'bg-[#d4af36] bg-opacity-10' : ''
        } ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} id={id} name={name} />
        {fileName ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">{fileName}</p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? 'Drop the file here' : 'Drag and drop a file here, or click to select a file'}
          </p>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}

export default function ScholarshipApplication() {
  const [darkMode, setDarkMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [files, setFiles] = useState<FileState>({
    application: null,
    proof: null,
    fsot: null
  })
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let hasError = false

    if (!fullName) {
      setError('Please provide your full name.')
      hasError = true
    }

    if (!files.application || !files.proof || !files.fsot) {
      setError('Please upload all required files.')
      hasError = true
    }

    if (hasError) {
      return
    }

    setError('')
    setIsSubmitting(true)
    
    try {
      console.log('Starting file uploads...')
      const formData = new FormData(e.currentTarget)

      // Upload files to Supabase storage
      const applicationPath = files.application ? await uploadFile(files.application, 'applications') : null
      console.log('Application file uploaded:', applicationPath)
      const proofPath = files.proof ? await uploadFile(files.proof, 'proofs') : null
      console.log('Proof file uploaded:', proofPath)
      const fsotPath = files.fsot ? await uploadFile(files.fsot, 'fsot') : null
      console.log('FSOT file uploaded:', fsotPath)

      console.log('Inserting submission into database...')
      // Insert submission into database
      const { data, error } = await supabase
        .from('scholarship_submissions')
        .insert([
          {
            full_name: formData.get('fullName') as string,
            application_file_path: applicationPath,
            attendance_file_path: proofPath,
            test_completion_file_path: fsotPath,
          },
        ])

      if (error) throw error

      console.log('Submission successful:', data)
      // Reset form
      setFullName('')
      setFiles({ application: null, proof: null, fsot: null })
      toast.success('Your application has been submitted successfully!')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(`An error occurred while submitting your application: ${(error as Error).message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    if (!file) {
      throw new Error(`No file provided for ${bucket} upload`)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    console.log(`Uploading file to ${bucket}: ${filePath}`)

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (error) {
        console.error(`Error uploading file to ${bucket}:`, error)
        throw error
      }

      if (!data) {
        throw new Error(`No data returned from ${bucket} upload`)
      }

      console.log(`File uploaded successfully to ${bucket}: ${filePath}`)
      return filePath
    } catch (error) {
      console.error(`Error in uploadFile function for ${bucket}:`, error)
      throw new Error(`Failed to upload file to ${bucket}: ${(error as Error).message}`)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-serif">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <header className="bg-white dark:bg-black py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-14 w-auto sm:h-14 md:h-14"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Home
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
          <button
            className="md:hidden text-[#d4af36] hover:text-[#b08d28] transition duration-300"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-50 bg-white dark:bg-black p-4 md:hidden"
        >
          <div className="flex justify-end">
            <button
              onClick={toggleMenu}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 mt-8">
            <Link href="/" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Home
            </Link>
            <Link href="/contact" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Contact Us
            </Link>
            <button
              onClick={() => {
                setDarkMode(!darkMode)
                toggleMenu()
              }}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </nav>
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">
          Application for the Kenneth W Bleakley Senior Foreign Service Officer Scholarship
        </h1>
        <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>

        <div className="mb-12 text-center">
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
            Please download the application, fill it out, and use the file submission module below to submit your completed application, your evidence of graduation or current attendance of Georgetown University, and your evidence of taking the FSOT test or good reason for failure to do so by October 31, 2024. You will be contacted if you have been awarded a scholarship.
          </p>
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
            Using the file upload module below, please submit your completed application. Recipients must submit proof of enrollment at Georgetown University. Evidence of taking/registering for the FSOT test must be submitted within 60 days of the scheduled test date.
          </p>
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
           Submission files must be in PDF format.
          </p> 
        </div>

        <form onSubmit={handleSubmit} className="mb-12 space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-[#d4af36]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-[#d4af36] transition-all duration-300 hover:shadow-xl">
            <Label htmlFor="fullName" className="text-lg font-semibold text-black dark:text-white mb-2 block">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border-2 border-[#d4af36] rounded-md text-center text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#d4af36] transition-all duration-300"
              placeholder="Enter your full name"
              required
            />
          </div>

          <FileUpload 
            label="Upload completed application" 
            id="application"
            name="application"
            onFileChange={(file) => setFiles(prev => ({ ...prev, application: file }))}
          />
          <FileUpload 
            label="Upload proof of attendance/graduation" 
            id="proof"
            name="proof"
            onFileChange={(file) => setFiles(prev => ({ ...prev, proof: file }))}
          />
          <FileUpload 
            label="Upload proof of FSOT test completion or good reason for failure to do so" 
            id="fsot"
            name="fsot"
            onFileChange={(file) => setFiles(prev => ({ ...prev, fsot: file }))}
          />

          {error && (
            <div className="text-red-500 text-center font-bold">
              {error}
            </div>
          )}

          <div className="text-center">
            <Button 
              type="submit" 
              className="bg-[#d4af36] hover:bg-[#b08d28] text-white text-lg py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>

        <div className="mb-12 overflow-hidden rounded-lg shadow-lg">
          <iframe 
            src="/Kenneth W. Bleakley Foreign Service Officer Scholarship.pdf" 
            className="w-full h-[600px] md:h-[800px] lg:h-[1000px]"
            title="Kenneth W. Bleakley Senior Foreign Service Officer Scholarship Application"
          />
        </div>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Kenneth W Bleakley Senior Foreign Service Officer Scholarships</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-black dark:text-[#d4af36]">Scholarship Information</h2>
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
          </div>
        </section>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">Scholarship Committee</h2>
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          <div className="grid grid-cols-2 gap-8">
            {[
              { name: "Albert L. Grasso", role: "Member", chapter: "Alpha Chapter", occupation: "Former Associate Professor", company: "Roosevelt University" },
              { name: "Carlos Roa", role: "Member", chapter: "Alpha Chapter", occupation: "Former Editor", company: "International Journal" },
              { name: "Timothy J. Rosenberger", role: "Member", chapter: "Alpha Chapter", occupation: "Fellow", company: "Stanford University" },
              { name: "Charles J. Skuba", role: "Chairman", chapter: "Alpha Chapter", occupation: "Professor", company: "Georgetown University" },
            ].map((officer, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 border-2 border-[#d4af36]">
                <h3 className="text-xl font-semibold mb-2 text-[#d4af36]">{officer.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-1">{officer.role}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.chapter}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{officer.occupation} at {officer.company}</p>
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