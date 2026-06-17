import Link from 'next/link'
import Image from 'next/image'

const QUICK_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/programs', label: 'Programs' },
  { href: '/scholarships', label: 'Awards and Scholarships' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/policies', label: 'Policies' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteFooter() {
  return (
    <footer className="bg-[#0a0e1a] text-white pt-16 pb-8 border-t border-[#d4af36]/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="text-center md:text-left">
            <Image
              src="/DPE-inverted.png"
              alt="Delta Phi Epsilon Foundation"
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
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-[#d4af36] transition duration-300 text-sm"
                >
                  {link.label}
                </Link>
              ))}
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
            <a
              href="https://www.aoniqq.com/websitecreation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition duration-300 text-xs"
            >
              Site by Aoniqq LLC
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
