import './globals.css'
import HeartbeatTrigger from '@/app/components/HeartbeatTrigger'

// Runs before first paint to apply the persisted theme (no flash of the wrong
// theme on load/navigation). Kept in sync at runtime by useDarkMode.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <title>Delta Phi Epsilon Foundation for Foreign Service Education</title>
        <meta name="description" content="Founded in 1962, the Delta Phi Epsilon Foundation for Foreign Service Education promotes the virtues of foreign service and helps educate the next generation of American global statesmen through scholarships and programming." />
        <meta name="theme-color" content="#0f1729" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Open Graph / social preview. NOTE: for image previews on Facebook/LinkedIn,
            replace the image with an absolute URL (https://yourdomain/og-image.png)
            once the production domain is known — some crawlers require absolute URLs. */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta property="og:title" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta property="og:description" content="Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen through scholarships and programming." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Delta Phi Epsilon Foundation for Foreign Service Education" />
        <meta name="twitter:description" content="Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen through scholarships and programming." />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body className="font-serif">
        <HeartbeatTrigger />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  )
}
