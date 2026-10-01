'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

const MAX_COMMENT = 10000
const FIELD_CLASS =
  'w-full p-2 border border-gray-300 rounded-md text-black bg-[#fdfcf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af36] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent'

export default function ScholarshipInput() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comments, setComments] = useState('')
  const [website, setWebsite] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (comments.trim().length < 10) {
      toast.error('Please write a little more before sending.')
      return
    }
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/scholarship-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          comments,
          website,
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(result.error || 'Something went wrong. Please try again.')
        return
      }

      setSent(true)
      setName('')
      setEmail('')
      setComments('')
    } catch (error) {
      console.error('Error submitting scholarship comments:', error)
      toast.error('Something went wrong. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <ToastContainer position="top-right" autoClose={6000} theme="light" />
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black text-center">
          Share Your Thoughts on the New Scholarship Program
        </h1>
        <OrnamentalDivider className="mb-8" />

        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-800 leading-relaxed mb-4">
            The Scholarship Committee welcomes the brotherhood&rsquo;s input. There is no form to
            fill out: tell us what you think in your own words. Comments go only to the
            Scholarship Committee, and they are deleted once the committee has finished its review.
          </p>

          {sent ? (
            <div
              role="status"
              className="p-8 bg-[#fdfcf9] rounded-lg border-t-2 border-[#d4af36] text-center shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
            >
              <h2 className="text-2xl font-semibold text-[#b08d28] mb-3">Thank you, brother.</h2>
              <p className="text-lg text-gray-800 mb-6">
                Your comments have been sent to the Scholarship Committee.
              </p>
              <Button
                type="button"
                onClick={() => setSent(false)}
                className="bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white rounded-full px-8"
              >
                Send another comment
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-8 p-8 bg-[#fdfcf9] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]"
            >
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
                <Label htmlFor="comments" className="text-lg font-semibold text-black mb-2 block">
                  Your comments
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Write as much or as little as you like."
                  rows={10}
                  maxLength={MAX_COMMENT}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-lg font-semibold text-black mb-2 block">
                  Your name <span className="text-sm font-normal text-gray-600">(optional)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Leave blank to comment anonymously"
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-lg font-semibold text-black mb-2 block">
                  Your email <span className="text-sm font-normal text-gray-600">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Only if you would like the committee to reply"
                  maxLength={320}
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white text-lg py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:shadow-[0_0_20px_rgba(212,175,54,0.3)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Comments'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
