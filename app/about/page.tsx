'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X } from 'lucide-react'
import { Button } from "@/app/components/ui/button"

export default function AboutUs() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-serif text-base sm:text-lg">
      <header className="bg-white dark:bg-black py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-12 w-auto sm:h-14 md:h-16"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Home
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Programs
            </Link>
            <Link href="/scholarship-application" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Scholarship Application
            </Link>
            <Link href="/policies" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Policies
            </Link>
            <Link href="/contact" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Contact Us
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
            </button>
          </nav>
          <Button 
            variant="ghost" 
            className="md:hidden text-[#d4af36]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white dark:bg-black py-2 px-4 absolute top-full left-0 right-0 shadow-md">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-7 w-7 text-[#d4af36]" />
              </Button>
            </div>
            <Link href="/" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Home
            </Link>
            <Link href="/scholarship-application" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Scholarship Application
            </Link>
            <Link href="/policies" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Policies
            </Link>
            <Link href="/programs" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Programs
            </Link>
            <Link href="/contact" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Contact Us
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-center py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl"
            >
              {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 text-center text-black dark:text-white">About Us</h1>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Certificate of Incorporation</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg text-base sm:text-lg">
            <p className="mb-4"><strong>FIRST.</strong> The name and title by which this corporation shall be known in law shall be DELTA PHI EPSILON FOUNDATION FOR FOREIGN SERVICE EDUCATION.</p>
            <p className="mb-4"><strong>SECOND.</strong> The term for which it is organized is perpetual.</p>
            <p className="mb-4"><strong>THIRD.</strong> The particular business and objects of the society shall be to promote the calling of Foreign Service and the various sciences which are a part thereof by education and mutual improvement of members; to promote better understanding by assisting centers for the study and appreciation of international relations; to diffuse knowledge concerning law, languages, and the many other subjects related thereto; to serve as a reference for all that relates to the calling; and to serve as a repository for Foreign Service literature.</p>
            <p className="mb-4"><strong>FOURTH.</strong> The number of its Trustees for the first year of its existence shall be nine.</p>
            <p className="mb-4"><strong>FIFTH.</strong> Such corporation is organized exclusively for educational, charitable and scientific purposes, in fields related to foreign service, foreign relations and foreign commerce of the United States, including, but not limited to, the making of scholarship awards and loans, the establishment of awards for achievement, the development and encouragement in, and the dissemination of information with respect to, those fields, and the making of distributions to organizations that qualify as exempt organizations under Section 501(c)(3) of the Internal Revenue Code of 1954 (or the corresponding provision of any future United States internal revenue law).</p>
            <p className="mb-4"><strong>SIXTH.</strong> No part of the net earnings of said corporation shall inure to the benefit of, or be distributed to, its members, officers, or other private persons, except that the corporation shall be authorized and empowered to pay reasonable compensation for services rendered and to make payments and distributions in furtherance of the purposes set forth herein. No substantial part of the activities of the corporation shall be the carrying on of propaganda or otherwise attempting to influence legislation; and the corporation shall not participate in, or intervene in, any political campaign (including the publishing or distribution of statements) on behalf of any candidate for public office. Notwithstanding any other provision of this Certificate of Incorporation, the corporation shall not carry on any other activities not permitted to be carried on: a) by a corporation exempt from Federal income tax under Section 501(c)(3) of the Internal Revenue Code of 1954 (or the corresponding provision of any future United States internal revenue law) or b) by a corporation contributions to which are deductible under Section 170(c)(2) of the Internal Revenue Code of 1954 (or the corresponding provision of any future United States internal revenue law).</p>
            <p><strong>SEVENTH.</strong> Upon the dissolution of the corporation, the Board of Trustees shall, after paying or making provision for the payment of all the liabilities of the corporation, dispose of all the assets of the corporation exclusively for the purposes of the corporation in such manner, or to such organization or organizations established and operated exclusively for educational, charitable or scientific purposes as shall at the time qualify as an exempt organization or organizations under Section 501(c)(3) of the Internal Revenue Code of 1954 (or the corresponding provision of any future United States internal revenue law), as the Board of Trustees shall determine.</p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Foundation History</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg text-base sm:text-lg space-y-4 text-center">
            <p>The Foundation was originally formed in 1960 by student, alumni and faculty by Brothers of Alpha Chapter of Delta Phi Epsilon Fraternity and was later incorporated with the adoption of a Certificate of Incorporation on May 16, 1962 and filed in the District of Columbia on May 23, 1962.</p>
            <p>The original Certificate had four Articles detailing the name, duration, purposes and number of Trustees. These Articles remain unchanged to the current date, although the number of Trustees was reduced to seven in 1984.</p>
            <p>To assure that all three classes of Alpha Chapter Brothers would be represented on the governing board of the Foundation, the initial Trustees included three undergraduate brothers, three alumni brothers and three Georgetown faculty brothers. The following individuals constituted the initial Board of Trustees:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h4 className="font-bold mb-2 text-[#d4af36] text-xl">Undergraduate Brothers</h4>
                <ul className="list-none pl-0">
                  <li>Louis Postiglione</li>
                  <li>Philip O&apos;Reilly</li>
                  <li>James E Condren</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-[#d4af36] text-xl">Alumni Brothers</h4>
                <ul className="list-none pl-0">
                  <li>James M vonStroebel</li>
                  <li>Bailey G Walsh</li>
                  <li>Vincent P Morelli</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-[#d4af36] text-xl">Faculty Brothers</h4>
                <ul className="list-none pl-0">
                  <li>John J Leahy</li>
                  <li>Joseph P LeMoine</li>
                  <li>Rocco E Porreco</li>
                </ul>
              </div>
            </div>
            <p>Without meaningful financial assets and no experience in fundraising, the objectives of acquiring property for a headquarters, create a library and provide a site for programs had to be postponed.</p>
            <p>Seven of the initial Trustees remained in office as of January 1983. James Condren and John Leahy had died in the interim. At a meeting on January 25, 1983, the number of Trustees was reduced to seven with the remaining original Trustees continuing to serve. At the same time, the following persons were elected as officers:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ul className="list-none pl-0">
                  <li>Joseph P LeMoine - President</li>
                  <li>Andrew J Garry - Vice President</li>
                </ul>
              </div>
              <div>
                <ul className="list-none pl-0">
                  <li>James M vonStroebel - Secretary</li>
                  <li>Terrence J Boyle - Treasurer</li>
                </ul>
              </div>
            </div>
            <p>A decision was made to seek tax exempt status for the organization in order to raise funds to support the activities of the Foundation. Alpha Chapter Brother Albert L Grasso, a tax attorney, volunteered to apply to the Internal Revenue Service for exemption pursuant to Section 501(c)(3) of the Internal Revenue Code.</p>
            <p>As part of the application process, the Certificate of Incorporation was amended on March 29, 1984 to add Articles Five through Seven to comply with IRS requirements for exemption. The complete Certificate of Incorporation is included on the website.</p>
            <p>In due course, with Brother Boyle as Treasurer and serving as the principal contact with the IRS, the Foundation was qualified as a Section 501(c)(3) tax exempt organization. A copy of the IRS Letter dated May 20, 1985, is included on the website. The initial grant of exemption was subject to review within five years by the IRS for compliance with all legal requirements. By Letter dated April 15, 1990, final approval by the IRS of the tax exemption was granted. A copy of the April 1990 letter is also included on the website.</p>
            <p>Between 1983 and 2005, numerous Alpha Chapter Brothers served as officers and trustees. During this period, Brother Boyle, in his capacity as Treasurer, raised $300,000 as an endowment fund for the Foundation with the intention of investing these donations into a fund to acquire a permanent home for the Foundation and use interest earnings for other Foundation activities, including scholarships and programming. The modest amounts of assets raised by donations plus the realty prices in the Georgetown area precluded a purchase at the time.</p>
            <p>By December 2005, the remaining four of the original Trustees (vonStroebel, Walsh, Morelli and Porreco) died or resigned and were replaced by younger Alpha Chapter alumni brothers. All Trustees were alumni brothers thereafter. Brother Boyle remained as the sole constant throughout this period and until his retirement in 2021 as Treasurer upon attaining age 80.</p>
            <p>No additional fundraising activities were conducted during the ensuing periods. The primary focus became educational programming. For example, between October 2013 and February 2019, the Foundation sponsored 19 educational lectures. Since the onset of the Covid-19 pandemic additional lectures have been curtailed but are now expected to be renewed.</p>
            <p>Following a decision by Georgetown University to require most undergraduate students to reside in university housing, maintenance of the Alpha Chapter fraternity house as a residence for undergraduate brothers became untenable. The undergraduate brothers of Alpha Chapter, with the support of a substantial number of alumni Alpha Chapter brothers who expressed an opinion, decided to donate the house to the Foundation with the expectation of a sale. Due to the tax exempt status of the Foundation, a sale by the Foundation meant that the sales proceeds would not be reduced by taxes. Without the donation a sale would be subject to substantial taxes.</p>
            <p>The fraternity house was donated to the Foundation and sold. The proceeds were held in escrow pending review by the D.C. Office of the Attorney General and ultimate approval by a judge on the D.C. Municipal Court. On several occasions during the pendency of the review, a substantial majority of the Alpha Chapter brothers voted to reaff

irm the donation to the Foundation. Final review and approval was granted and the escrowed funds were released to the Foundation on August 12,2024.</p>
            <p>As of May 11, 2020, the Trustees included:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ul className="list-none pl-0">
                <li>Matthew Ellison</li>
                <li>Stratton Poland</li>
              </ul>
              <ul className="list-none pl-0">
                <li>Joseph Picozzi</li>
                <li>Marcus King</li>
                <li>Thomas Stewart</li>
              </ul>
              <ul className="list-none pl-0">
                <li>Michael Eriksen</li>
                <li>Matthew Mixa</li>
              </ul>
              </div>
              <p>At the time, these Trustees were the guardians of the original goals and objectives of the Foundation. Upon the donation of the fraternity house they realized that the funds to pursue such goals might soon be available.</p>
              <div>
            </div>
            <p>At the time final approval was granted only Brothers Stewart, Picozzi and Eriksen continued to serve. Newly appointed trustees include Carlos Roa, Kenneth W Bleakley (recently deceased), Albert L Grasso and Timothy J Rosenberger. The current Board of Trustees has commenced to fulfill the original goals and objectives. Initial scholarships have been awarded and additional scholarships are planned. Efforts have begun to restart educational programs. Contact has been made with real estate agents to secure a home for the Foundation and a situs for its activities.</p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Foundation Officers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Albert L. Grasso", role: "Treasurer", chapter: "Alpha Chapter", line: "92 Line" },
              { name: "Joseph S. Picozzi", role: "President", chapter: "Alpha Chapter", line: "" },
              { name: "Carlos F. Roa", role: "Secretary", chapter: "Alpha Chapter", line: "189 Line" },
            ].map((officer, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">{officer.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-1 text-lg">{officer.role}</p>
                <p className="text-gray-500 dark:text-gray-400 text-base">{officer.chapter}</p>
                {officer.line && <p className="text-gray-500 dark:text-gray-400 text-base">{officer.line}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Foundation Trustees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Michael D. Eriksen", role: "Alpha Chapter", denomination: "99 Line", occupation: "Attorney" },
              { name: "Albert L. Grasso", role: "Alpha Chapter", denomination: "92 Line", occupation: "Attorney" },
              { name: "Joseph S. Picozzi", role: "Alpha Chapter", denomination: "", occupation: "Politician" },
              { name: "Carlos F. Roa", role: "Alpha Chapter", denomination: "189 Line", occupation: "Editor" },
              { name: "Timothy J. Rosenberger", role: "Alpha Chapter", denomination: "206 Line", occupation: "Attorney" },
              { name: "Thomas Stewart", role: "Alpha Chapter", denomination: "193 Line", occupation: "Data Analyst" },
            ].map((trustee, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">{trustee.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-1 text-lg">{trustee.role}</p>
                {trustee.denomination && <p className="text-gray-500 dark:text-gray-400 text-base">{trustee.denomination}</p>}
                {trustee.occupation && <p className="text-gray-500 dark:text-gray-400 text-base mt-1">{trustee.occupation}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Affiliated Organizations</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <ul className="space-y-4 text-gray-800 dark:text-gray-200 text-center">
              {[
                "Delta Phi Epsilon Professional Foreign Service Fraternity, Inc.",
                "Delta Phi Epsilon Fraternity",
                "Washington Area Alumni Association",
                "Alpha Chapter, Delta Phi Epsilon",
                "Delta Phi Epsilon, Inc."
              ].map((org, index) => (
                <li key={index} className="text-xl font-semibold">{org}</li>
              ))}
            </ul>
            <p className="mt-6 text-gray-600 dark:text-gray-400 text-center text-lg">
              Each of the above entities is a separate legal entity which is neither owned nor controlled by 
              the Foundation and has its own management team.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-[#d4af36] text-lg">
            Delta Phi Epsilon Foundation for Foreign Service Education is a 501(c)(3) tax-exempt organization and is not affiliated with Georgetown University, the government of the United States or any of its subdivisions, agencies or departments.
          </p>
          <div className="flex flex-col items-center">
            <Link href="/contact">
              <Button 
                variant="link" 
                className="text-[#d4af36] hover:text-white transition duration-300 text-lg"
              >
                Contact Us
              </Button>
            </Link>
            <Button 
              variant="link" 
              className="text-[#d4af36] hover:text-white transition duration-300 underline text-lg"
              onClick={() => window.open('https://www.aoniqq.com/websitecreation', '_blank')}
            >
              Site by Aoniqq LLC
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}