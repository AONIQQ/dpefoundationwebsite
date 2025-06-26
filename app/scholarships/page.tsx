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
  intern: File | null;
  requirements: File | null;
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
    fsot: null,
    intern: null,
    requirements: null
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

 
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, scholarshipType: string) => {
  e.preventDefault()
  let hasError = false

  if (!fullName) {
    setError('Please provide your full name.')
    hasError = true
  }

  if (scholarshipType === 'bleakley' && (!files.application || !files.proof || !files.fsot)) {
    setError('Please upload all required files for the Bleakley Scholarship.')
    hasError = true
  } else if (scholarshipType === 'weiss' && (!files.application || !files.proof || !files.intern)) {
    setError('Please upload all required files for the Weiss Scholarship.')
    hasError = true
  } else if (scholarshipType === 'butts' && (!files.application || !files.proof || !files.requirements)) {
    setError('Please upload all required files for the Butts Scholarship.')
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
    let applicationPath, proofPath, additionalFilePath = null

    if (scholarshipType === 'bleakley') {
      // Use original bucket names for Bleakley scholarship
      applicationPath = files.application ? await uploadFile(files.application, 'applications') : null
      proofPath = files.proof ? await uploadFile(files.proof, 'proofs') : null
      additionalFilePath = files.fsot ? await uploadFile(files.fsot, 'fsot') : null
    } else if (scholarshipType === 'weiss') {
      // Use new bucket names for Weiss scholarship
      applicationPath = files.application ? await uploadFile(files.application, 'weiss-applications') : null
      proofPath = files.proof ? await uploadFile(files.proof, 'weiss-attendance-proof') : null
      additionalFilePath = files.intern ? await uploadFile(files.intern, 'weiss-intern-proof') : null
    } else if (scholarshipType === 'butts') {
      // Use new bucket names for Butts scholarship
      applicationPath = files.application ? await uploadFile(files.application, 'butts-applications') : null
      proofPath = files.proof ? await uploadFile(files.proof, 'butts-attendance-proof') : null
      additionalFilePath = files.requirements ? await uploadFile(files.requirements, 'butts-requirements') : null
    }

    console.log('Files uploaded successfully')

    // Insert submission into database
    const { data, error } = await supabase
      .from(`${scholarshipType}_scholarship_submissions`)
      .insert([
        {
          full_name: formData.get('fullName') as string,
          application_file_path: applicationPath,
          attendance_file_path: proofPath,
          [scholarshipType === 'bleakley' ? 'test_completion_file_path' : 
           scholarshipType === 'weiss' ? 'intern_completion_file_path' :
           'additional_requirements_file_path']: additionalFilePath,
        },
      ])

    if (error) throw error

    console.log('Submission successful:', data)
    // Reset form
    setFullName('')
    setFiles({ application: null, proof: null, fsot: null, intern: null, requirements: null })
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
         <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Programs
            </Link>
            <Link href="/facilities" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Facilities
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
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              About Us
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Programs
            </Link>
            <Link href="/facilities" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Facilities
            </Link>
            <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Policies
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
        <h2 className="text-4xl md:text-8xl font-bold mb-6 text-black dark:text-white text-center">Scholarships</h2>

        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Scholarship Committee</h2>
          <div className="w-20 h-1 bg-[#d4af36] mx-auto mb-10"></div>
          <div className="grid grid-cols-2 gap-8">
            {[
              { name: "Albert L. Grasso", role: "Member", chapter: "Alpha Chapter", occupation: "Former Associate Professor", company: "Roosevelt University" },
              { name: "Carlos F. Roa", role: "Member", chapter: "Alpha Chapter", occupation: "Former Editor", company: "International Journal" },
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

        {/* Landegger Program Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Landegger Program in International Business Diplomacy</h2>
          <p className="text-2xl font-semibold mb-4 text-[#d4af36] text-center">School of Foreign Service</p>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <div className="bg-gray-100 dark:bg-black p-8 rounded-lg shadow-lg border-2 border-transparent dark:border-white">
            <h3 className="text-2xl font-semibold mb-4 text-[#d4af36] text-center">Global Impact Pitch Competition</h3>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              Effective with Spring 2025, the Foundation has partnered with the Landegger Program within the Georgetown School of Foreign Service as a contributing sponsor of the annual Global Impact Pitch Competition (GIPC).
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              The Landegger Program is an honors certificate program within the School of Foreign Service that blends international business with international diplomacy.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              The GIPC is an innovative entrepreneurial event now in its eighth year hosted by the Landegger Program and serving the entire Georgetown University community. The Competition features thousands of dollars in prize money plus networking and mentoring opportunities in support of implementation of entries.
            </p>
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-4 text-[#d4af36]">Selection criteria include:</h4>
              <ul className="list-disc pl-6 text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed space-y-2">
                <li>Potential for positive impact on an international challenge, problem or issue broadly defined.</li>
                <li>Potential for financial sustainability.</li>
                <li>Solving a problem or meeting a need that someone is willing to finance.</li>
                <li>Strong founder fit, high likelihood of implementation and impact of the award.</li>
              </ul>
            </div>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              For additional information about the Program and Competition, visit{' '}
              <a href="https://www.ibd.georgetown.edu" target="_blank" rel="noopener noreferrer" className="text-[#d4af36] hover:underline">
                www.ibd.georgetown.edu
              </a>.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed">
              The Trustees believe that participation as a sponsor of the Competition promotes Foundation objectives similar to the granting of scholarships.
            </p>
          </div>
        </section>

        {/* Kenneth W Bleakley Scholarship Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Kenneth W Bleakley Senior Foreign Service Officer Scholarships</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <div className="bg-gray-100 dark:bg-black p-8 rounded-lg shadow-lg border-2 border-transparent dark:border-white">
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              Kenneth W Bleakley had a distinguished 29-year career as a U.S. Foreign Service Officer which included serving as President George H.W. Bush&apos;s Senior Deputy U.S. Coordinator for International Communications and Information Policy, Deputy Chief of Mission in San Salvador, Director of U.S. Operations in Central America and Director of the U.S. International Refugee Program. He was President of the American Foreign Service Association and Delta Phi Epsilon Professional Foreign Service Fraternity.
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
                { title: "Scholarship Amount", content: "Scholarships in the amount of $250 per recipient will be awarded to Georgetown university degree program students or graduates who apply to take the US Foreign Service Officer Test scheduled throughout the year." }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">
            Kenneth W Bleakley Senior Foreign Service Officer Scholarship Form
          </h1>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>

          <div className="mb-12 text-center">
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Please download the application, fill it out, and use the file submission module below to submit your completed application, your evidence of graduation or current attendance of Georgetown University, and your evidence of taking the FSOT test or good reason for failure to do so. You will be contacted if you have been awarded a scholarship.
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Using the file upload module below, please submit your completed application. Recipients must submit proof of enrollment at Georgetown University. Evidence of taking/registering for the FSOT test must be submitted within 60 days of the scheduled test date.
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
             Submission files must be in PDF format.
            </p> 
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
            The present Administration cancelled the February 2025 test and postponed testing until further notice.
            </p> 
           
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'bleakley')} className="mb-12 space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-[#d4af36]">
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
              id="bleakley-application"
              name="application"
              onFileChange={(file) => setFiles(prev => ({ ...prev, application: file }))}
            />
            <FileUpload 
              label="Upload proof of attendance/graduation" 
              id="bleakley-proof"
              name="proof"
              onFileChange={(file) => setFiles(prev => ({ ...prev, proof: file }))}
            />
            <FileUpload 
              label="Upload proof of FSOT test completion or good reason for failure to do so" 
              id="bleakley-fsot"
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
        </section>

        {/* Stanley Weiss Scholarship Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Stanley Weiss Global Business Leader Scholarships</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <div className="bg-gray-100 dark:bg-black p-8 rounded-lg shadow-lg border-2 border-transparent dark:border-white">
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              Stanley Weiss enrolled in Georgetown University School of Foreign Service after service in the U.S. Army between 1944 and 1946.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              After graduation from Georgetown, he moved to Mexico to establish mining operations, eventually becoming the largest supplier of magnesia in North America. Later, he was involved with the Soviet - American Trading Corporation (SATC) to import Soviet chromium. At one time, SATC was responsible for 80% of U.S./Soviet trade.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              In addition to his business interests Mr. Weiss was actively involved in various organizations, Including:
            </p>
            <ul className="list-disc pl-6 text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              <li>Founder - Business Executives for National Security</li>
              <li>Board of Visitors - Georgetown University School of Foreign Service</li>
              <li>Advisory Board - RAND Center for Middle East Public Policy</li>
              <li>Advisory Board - International Crisis Group</li>
            </ul>
          </div>
        </section>

      
          <section className="mb-20 bg-[#d4af36] dark:bg-black rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-black dark:text-[#d4af36]">Scholarship Information</h2>
          <div className="w-20 h-1 bg-black dark:bg-[#d4af36] mx-auto mb-6"></div>
          <div className="bg-white dark:bg-black p-6 rounded-lg border-2 border-black dark:border-white">
            <p className="text-lg mb-10 text-center max-w-3xl mx-auto text-black dark:text-white">
            The Trustees of the Delta Phi Epsilon Foundation for Foreign Service
Education have decided to honor Stanley Weiss, a global business leader,
member of the Board of Visitors of the Georgetown University Walsh School of
Foreign Service and DPE fraternity brother by the establishment of a
Scholarship Award Program in his name. </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Submission Requirements", content: "Scholarship applicants must submit their names, email addresses, current residence address, phone number, and statement of current enrollment in the Global Business Fellows program at Georgetown University and acceptance in the Baratta Center internships in applied global business and policy. Please submit the form provided." },
                { title: "Eligibility for The Stanley Weiss Global Business Leader Scholarship", content: "The Stanley Weiss Global Business Leader Scholarships will be awarded to Georgetown University junior or senior students enrolled in the Global Business Fellows program at Georgetown University’s McDonough School of Business and approved by the Baratta Center for Global Business as qualified for internship work on applied global business and policy projects." },
                { title: "Scholarship Amount", content: "These $500 scholarships will be awarded to those Global Business Fellows students who are identified by the Baratta Center for Global Business as qualifying for the internship program as one part of the Baratta Center compensation award." }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">
            Stanley Weiss Global Business Leader Scholarship Form
          </h1>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>

          <div className="mb-12 text-center">
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Please download the application, fill it out, and use the file submission module below to submit your completed application, your evidence of graduation or current attendance of Georgetown University, and your evidence of completing the Baratta Center Intern Program. You will be contacted if you have been awarded a scholarship.
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Submission files must be in PDF format.
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'weiss')} className="mb-12 space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-[#d4af36]">
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
              id="weiss-application"
              name="application"
              onFileChange={(file) => setFiles(prev => ({ ...prev, application: file }))}
            />
            <FileUpload 
              label="Upload proof of attendance/graduation" 
              id="weiss-proof"
              name="proof"
              onFileChange={(file) => setFiles(prev => ({ ...prev, proof: file }))}
            />
            <FileUpload 
              label="Upload proof of approval for the Baratta Center Intern Program" 
              id="weiss-intern"
              name="intern"
              onFileChange={(file) => setFiles(prev => ({ ...prev, intern: file }))}
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
              src="/Weiss.pdf" 
              className="w-full h-[600px] md:h-[800px] lg:h-[1000px]"
              title="Stanley Weiss Global Business Leader Scholarship Application"
            />
          </div>
        </section>
    

        {/* Halleck A Butts Scholarship Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white text-center">Halleck A Butts Career Diplomat Scholarships</h2>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>
          <div className="bg-gray-100 dark:bg-black p-8 rounded-lg shadow-lg border-2 border-transparent dark:border-white">
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              After service in World War I, Halleck A. Butts graduated from Georgetown University&#39;s School of Foreign Service in 1921 and was the first President of the Alpha Chapter of Delta Phi Epsilon National Professional Foreign Service Fraternity at Georgetown. Prior to his graduation, he was appointed U.S. Trade Commissioner at the American embassy in Tokyo and later became the U.S. Commercial Attaché. He served at the U.S. embassy in Tokyo from 1920 to 1933.
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              During World War II, he was Chief of the Japan Section in the U.S. Foreign Economic Administration. He was also associate professor of economics at Duke University, detailed to the Army Finance School to lecture on Far Eastern economics and on Japan&apos;s financial institutions and fiscal policy. He was also a lecturer at the Army Civil Affairs Training Schools at Harvard and Northwestern Universities,
            </p>
            <p className="text-lg md:text-xl text-gray-800 dark:text-white leading-relaxed mb-6">
              He joined the Industrial College of the Armed Forces (ICAF – later renamed the National Defense University) in July 1944 as Assistant Director of Research, Foreign Economic Resources Group and then served as Foreign Economic Advisor to the Army Service Forces (ASF). While there, he also returned to Georgetown as an associate professor of economics. After World War II, while still teaching at Georgetown, Mr. Butts became Chief of the Economic Potential Branch of the Industrial College of the Armed Forces (now known as the National Defense University). He then served his country at the Central Intelligence Agency.
            </p>
          </div>
        </section>

        <section className="mb-20 bg-[#d4af36] dark:bg-black rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-black dark:text-[#d4af36]">Scholarship Information</h2>
          <div className="w-20 h-1 bg-black dark:bg-[#d4af36] mx-auto mb-6"></div>
          <div className="bg-white dark:bg-black p-6 rounded-lg border-2 border-black dark:border-white">
          <p className="text-lg mb-10 text-center max-w-3xl mx-auto text-black dark:text-white">
          The Trustees of the Delta Phi Epsilon Foundation for Foreign Service
Education have decided to honor Halleck A. Butts, a distinguished career
diplomat, Georgetown University professor, and the first President of the
Delta Phi Epsilon National Professional Foreign Service Fraternity, by the
establishment of a Scholarship Award Program in his name.</p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Submission Requirements", content: "Scholarship applicants must submit their names, email addresses, current residence address, phone number, and statement of current attendance or graduation from degree programs at Georgetown University. Please submit the form provided." },
                { title: "Eligibility for The Halleck A. Butts Career Diplomat Scholarship", content: "The Halleck A. Butts Career Diplomat Scholarships will be awarded to Georgetown University students enrolled in the Dikran Izmirlian Program of Business and Global Affairs (BGA) – Georgetown’s joint undergraduate degree program between the Walsh School of Foreign Service and the McDonough School of Business." },
                { title: "Scholarship Amount", content: "These $500 scholarships will be awarded to those Izmirlian BGA students who are identified by the program as qualifying for financial need for expenses related to the program's international study and travel requirements." }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">
            Halleck A Butts Scholarship Application Form
          </h1>
          <div className="w-32 h-1 bg-[#d4af36] mx-auto mb-8"></div>

          <div className="mb-12 text-center">
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Please download the application, fill it out, and use the file submission module below to submit your completed application, your evidence of graduation or current attendance of Georgetown University, and any additional requirements specified for this scholarship. You will be contacted if you have been awarded a scholarship.
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              Submission files must be in PDF format.
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'butts')} className="mb-12 space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-[#d4af36]">
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
              id="butts-application"
              name="application"
              onFileChange={(file) => setFiles(prev => ({ ...prev, application: file }))}
            />
            <FileUpload 
              label="Upload proof of attendance/graduation" 
              id="butts-proof"
              name="proof"
              onFileChange={(file) => setFiles(prev => ({ ...prev, proof: file }))}
            />
            <FileUpload 
              label="Upload proof of enrollment in the Dikran Izmirlian Program of Business and Global Affairs program" 
              id="butts-requirements"
              name="requirements"
              onFileChange={(file) => setFiles(prev => ({ ...prev, requirements: file }))}
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
              src="/Butts.pdf" 
              className="w-full h-[600px] md:h-[800px] lg:h-[1000px]"
              title="Halleck A Butts Scholarship Career Diplomat Application"
            />
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