import './globals.css'
import HeartbeatTrigger from '@/app/components/HeartbeatTrigger'

const SITE_URL = 'https://dpefoundation.org'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Delta Phi Epsilon Foundation for Foreign Service Education</title>
        <meta name="description" content="Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education promotes the virtues of foreign service and helps educate the next generation of American global statesmen through scholarships and programming." />
        <meta name="theme-color" content="#faf8f5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Open Graph / social preview */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta property="og:title" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta property="og:description" content="Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen through scholarships and programming." />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta name="twitter:description" content="Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen through scholarships and programming." />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      </head>
      <body className="font-serif">
        <HeartbeatTrigger />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  )
}
