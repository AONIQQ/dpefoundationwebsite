'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import OrnamentalDivider from '@/app/components/OrnamentalDivider'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

interface Comment {
  id: number
  created_at: string
  name: string | null
  email: string | null
  comments: string
}

type View = 'loading' | 'login' | 'comments'

const CARD_CLASS =
  'bg-[#fdfcf9] rounded-lg shadow-[0_2px_15px_-3px_rgba(212,175,54,0.08),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-t-2 border-[#d4af36]'
const GOLD_BUTTON =
  'bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white rounded-full px-6'

export default function ScholarshipCommentsCommittee() {
  const [view, setView] = useState<View>('loading')
  const [comments, setComments] = useState<Comment[]>([])
  const [password, setPassword] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/committee/comments', { cache: 'no-store' })
      if (response.status === 401) {
        setView('login')
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setComments(data.comments ?? [])
      setView('comments')
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Could not load the comments. Please refresh the page.')
      setView('login')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsWorking(true)
    try {
      const response = await fetch('/api/committee/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(result.error || 'Could not sign in.')
        return
      }
      setPassword('')
      await load()
    } catch {
      toast.error('Could not sign in. Please try again.')
    } finally {
      setIsWorking(false)
    }
  }

  const signOut = async () => {
    await fetch('/api/committee/session', { method: 'DELETE' }).catch(() => undefined)
    setComments([])
    setView('login')
  }

  const remove = async (payload: { id: number } | { upToId: number }, confirmedMessage: string) => {
    setIsWorking(true)
    try {
      const response = await fetch('/api/committee/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.status === 401) {
        toast.error('Your session has expired. Please sign in again.')
        setView('login')
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      toast.success(confirmedMessage)
      await load()
    } catch (error) {
      console.error('Error deleting comments:', error)
      toast.error('Could not delete. Nothing was changed. Please try again.')
    } finally {
      setIsWorking(false)
    }
  }

  const deleteOne = (c: Comment) => {
    if (!window.confirm('Permanently delete this comment? This cannot be undone.')) return
    remove({ id: c.id }, 'Comment deleted.')
  }

  const deleteAll = () => {
    const typed = window.prompt(
      `This permanently deletes all ${comments.length} comment${comments.length === 1 ? '' : 's'} and cannot be undone.\n\nType DELETE to confirm.`
    )
    if (typed?.trim() !== 'DELETE') return
    // Only what is on screen: anything that arrived since the page loaded has a
    // higher id and survives to be read.
    remove({ upToId: Math.max(...comments.map((c) => c.id)) }, 'The comments shown were deleted.')
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-serif">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black text-center">
          Scholarship Program Comments
        </h1>
        <OrnamentalDivider className="mb-8" />

        {view === 'loading' && <p className="text-center text-gray-700">Loading&hellip;</p>}

        {view === 'login' && (
          <form onSubmit={signIn} className={`max-w-md mx-auto space-y-6 p-8 ${CARD_CLASS}`}>
            <p className="text-gray-800 text-center">For members of the Scholarship Committee.</p>
            <div>
              <Label htmlFor="password" className="text-lg font-semibold text-black mb-2 block">
                Committee password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full p-2 border border-gray-300 rounded-md text-black bg-[#fdfcf9]"
                required
              />
            </div>
            <div className="text-center">
              <Button type="submit" disabled={isWorking} className={GOLD_BUTTON}>
                {isWorking ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        )}

        {view === 'comments' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-lg text-gray-800">
                {comments.length === 0
                  ? 'No comments yet.'
                  : `${comments.length} comment${comments.length === 1 ? '' : 's'}, newest first`}
              </p>
              <div className="flex gap-3">
                {comments.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={deleteAll}
                    disabled={isWorking}
                    className="border-red-600 text-red-700 hover:bg-red-50 rounded-full"
                  >
                    Delete all
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={signOut} className="rounded-full">
                  Sign out
                </Button>
              </div>
            </div>

            <ul className="space-y-6">
              {comments.map((c) => (
                <li key={c.id} className={`p-6 ${CARD_CLASS}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-lg font-semibold text-[#b08d28]">{c.name || 'Anonymous'}</p>
                      {c.email && (
                        <a href={`mailto:${encodeURIComponent(c.email)}`} className="text-sm text-gray-700 hover:underline">
                          {c.email}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(c.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">{c.comments}</p>
                  <div className="mt-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => deleteOne(c)}
                      disabled={isWorking}
                      className="text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
