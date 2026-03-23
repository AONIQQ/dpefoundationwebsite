'use client'

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Menu, X } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'

export default function Contact() {
  const [darkMode, setDarkMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('contact_form_submissions')
        .insert([
          { full_name: name, email, message },
        ])

      if (error) throw error

      toast.success('Your message has been sent successfully!')
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('An error occurred while submitting your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1729] transition-colors duration-300 font-serif texture-grain">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <header className="bg-white/80 dark:bg-[#0f1729]/80 backdrop-blur-md py-4 sticky top-0 z-50 shadow-sm border-b border-[#d4af36]/20">
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
            <Link href="/scholarships" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarships
            </Link>
            <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Policies
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
          className="fixed inset-0 z-50 bg-white/95 dark:bg-[#0f1729]/95 backdrop-blur-sm p-4 md:hidden"
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
            <Link href="/scholarships" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Scholarships
            </Link>
            <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-lg">
              Policies
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
          Contact Us
        </h1>
        <OrnamentalDivider className="mb-8" />

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 p-8 bg-[#fdfcf9] dark:bg-[#131d33] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]">
          <div>
            <Label htmlFor="name" className="text-lg font-semibold text-black dark:text-white mb-2 block">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33]"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-lg font-semibold text-black dark:text-white mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-lg font-semibold text-black dark:text-white mb-2 block">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33]"
              placeholder="Enter your message"
              rows={5}
              required
            />
          </div>

          <div className="text-center">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white text-lg py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:shadow-[0_0_20px_rgba(212,175,54,0.3)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
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