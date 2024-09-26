'use client'

import { useEffect } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'


const inter = Inter({ subsets: ['latin'] })

function HeartbeatTrigger() {
  useEffect(() => {
    const triggerHeartbeat = async () => {
      console.log('Triggering heartbeat...')
      try {
        const response = await fetch('/api/heartbeat', { method: 'POST' })
        if (!response.ok) {
          console.error('Failed to trigger heartbeat', await response.text())
        } else {
          const data = await response.json()
          console.log('Heartbeat response:', data)
          
          // Fetch the current heartbeat data
          const getResponse = await fetch('/api/heartbeat', { method: 'GET' })
          if (getResponse.ok) {
            const getData = await getResponse.json()
            console.log('Current heartbeat data:', getData)
          } else {
            console.error('Failed to fetch heartbeat data', await getResponse.text())
          }
        }
      } catch (error) {
        console.error('Error triggering heartbeat:', error)
      }
    }

    // Trigger heartbeat immediately on component mount
    triggerHeartbeat()

    // Set interval to 6 days (in milliseconds)
    const SIX_DAYS_IN_MS = 6 * 24 * 60 * 60 * 1000
    const intervalId = setInterval(triggerHeartbeat, SIX_DAYS_IN_MS)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])

  return null
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HeartbeatTrigger />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  )
}