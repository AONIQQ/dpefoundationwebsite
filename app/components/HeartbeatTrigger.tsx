'use client'

import { useEffect } from 'react'

/**
 * Fires a keep-alive heartbeat to /api/heartbeat on mount and every 6 days.
 * Extracted into its own client component so the root layout can stay a
 * Server Component (required for the pre-paint theme script in <head> to
 * render reliably into the initial HTML).
 */
export default function HeartbeatTrigger() {
  useEffect(() => {
    const triggerHeartbeat = async () => {
      try {
        const response = await fetch('/api/heartbeat', { method: 'POST' })
        if (!response.ok) {
          console.error('Failed to trigger heartbeat', await response.text())
        } else {
          await response.json()
          const getResponse = await fetch('/api/heartbeat', { method: 'GET' })
          if (!getResponse.ok) {
            console.error('Failed to fetch heartbeat data', await getResponse.text())
          }
        }
      } catch (error) {
        console.error('Error triggering heartbeat:', error)
      }
    }

    triggerHeartbeat()

    const SIX_DAYS_IN_MS = 6 * 24 * 60 * 60 * 1000
    const intervalId = setInterval(triggerHeartbeat, SIX_DAYS_IN_MS)
    return () => clearInterval(intervalId)
  }, [])

  return null
}
