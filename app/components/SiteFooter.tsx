import Link from 'next/link'
import Image from 'next/image'

const EXPLORE_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/programs', label: 'Programs' },
  { href: '/scholarships', label: 'Awards and Scholarships' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/policies', label: 'Policies' },
  { href: '/donate', label: 'Donate' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteFooter() {
  return (
    <footer className="bg-[#f5f0e8] text-gray-700 pt-14 pb-8 border-t-2 border-[#d4af36]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Image
            src="/DPE.png"
            alt="Delta Phi Epsilon Foundation for Foreign Service Education"
            width={320}
            height={80}
            className="h-12 sm:h-14 w-auto mx-auto"
          />
          <p className="text-[#b08d28] text-xs tracking-[0.3em] mt-4">EST. 1962</p>
          <div className="flex items-center justify-center gap-2 mt-5" aria-hidden="true">
            <span className="h-px w-14 bg-[#d4af36]/60" />
            <span className="text-[#d4af36] text-[8px]">&#9670;</span>
            <span className="h-px w-14 bg-[#d4af36]/60" />
          </div>
          <div className="mt-7">
            <Link
              href="/donate"
              className="inline-block bg-gradient-to-r from-[#d4af36] to-[#c5a033] hover:from-[#b08d28] hover:to-[#9a7b22] text-white text-sm font-semibold rounded-full px-6 py-2.5 transition duration-300"
            >
              Support the Foundation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="text-center md:text-left">
            <h4 className="text-[#b08d28] text-xs tracking-[0.2em] uppercase mb-4">The Foundation</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Founded in 1962, promoting the virtues of foreign service and educating the next generation of American global statesmen.
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-[#b08d28] text-xs tracking-[0.2em] uppercase mb-4">Explore</h4>
            <nav className="flex flex-col space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[#b08d28] transition duration-300 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-[#b08d28] text-xs tracking-[0.2em] uppercase mb-4">Contact</h4>
            <p className="text-gray-600 text-sm">Georgetown Court</p>
            <p className="text-gray-600 text-sm mb-3">3222 N Street NW, Washington DC 20007</p>
            <Link href="/contact" className="text-[#b08d28] hover:text-[#9a7b22] transition duration-300 text-sm font-medium">
              Send us a message &rarr;
            </Link>
          </div>
        </div>

        <div className="border-t border-[#d4af36]/20 mt-12 pt-6 max-w-5xl mx-auto">
          <p className="text-xs text-gray-500 text-center mb-3 leading-relaxed">
            Delta Phi Epsilon Foundation for Foreign Service Education is a 501(c)(3) tax-exempt organization and is not affiliated with Georgetown University, the government of the United States or any of its subdivisions, agencies or departments.
          </p>
          <p className="text-center">
            <a
              href="https://www.aoniqq.com/websitecreation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition duration-300 text-xs"
            >
              Site by Aoniqq LLC
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
