'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import { useDarkMode } from '@/app/components/useDarkMode'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function Contact() {
  const [darkMode] = useDarkMode()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formLoadedAtRef = useRef<number>(0)

  useEffect(() => {
    formLoadedAtRef.current = Date.now()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const elapsedMs = Date.now() - formLoadedAtRef.current
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    const looksLikeSpam =
      website.length > 0 ||
      elapsedMs < 3000 ||
      trimmedName.length < 2 ||
      !/[a-zA-Z]/.test(trimmedName) ||
      trimmedMessage.length < 10

    if (looksLikeSpam) {
      toast.success('Your message has been sent successfully!')
      setName('')
      setEmail('')
      setMessage('')
      setWebsite('')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('contact_form_submissions')
        .insert([
          { full_name: trimmedName, email, message: trimmedMessage },
        ])

      if (error) throw error

      toast.success('Your message has been sent successfully!')
      setName('')
      setEmail('')
      setMessage('')
      setWebsite('')
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('An error occurred while submitting your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1729] transition-colors duration-300 font-serif texture-grain">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme={darkMode ? 'dark' : 'light'} />
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white text-center">
          Contact Us
        </h1>
        <OrnamentalDivider className="mb-8" />

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 p-8 bg-[#fdfcf9] dark:bg-[#131d33] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]">
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
          >
            <label htmlFor="website">Website (leave this field empty)</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="name" className="text-lg font-semibold text-black dark:text-white mb-2 block">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
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
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
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
              className="w-full p-2 border border-gray-300 dark:border-[#d4af36] rounded-md text-black dark:text-white bg-[#fdfcf9] dark:bg-[#131d33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
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

      <SiteFooter />
    </div>
  )
}