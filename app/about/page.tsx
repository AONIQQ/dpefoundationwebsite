'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, X, Folder, FolderOpen } from 'lucide-react'
import { Button } from "@/app/components/ui/button"

export default function AboutUs() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeHonorees, setActiveHonorees] = useState<Set<number>>(() => new Set())

  const hallOfFameHonorees: { name: string; bio: string[] }[] = [
    {
      name: "Walter I. (Jack) Giles",
      bio: [
        "Walter I. (Jack) Giles was born in Oklahoma in 1920 and entered Georgetown University’s School of Foreign Service in 1938. He graduated with a BSFS in 1942. After serving in the U.S. Army Air Corps during World War II, he received both an M.A. and Ph.D. in Government from Georgetown University.",
        "Although he originally intended to pursue a career in the U.S. Foreign Service, he discovered a passion for teaching at Georgetown while taking a required undergraduate U.S. Constitutional Law course from James T. Lowe — a passion he never lost.",
        "Professor Giles spent 43 years teaching at Georgetown University, becoming the university’s longest-serving full-time career faculty member.",
        "In 1967 he was the first recipient of the School of Foreign Service Faculty Award, and in 1985 he received the Alumni Award for University Service.",
        "In 1949 he organized and headed what ultimately became the Georgetown University chapter of the national academic honor society Phi Beta Kappa.",
        "Professor Giles was routinely honored by his students; many contributed after his death to endow a Constitutional Law seminar in his name.",
        "For several years before he became a teacher, he served as personal secretary to Father Edmund A. Walsh, the founder of Georgetown’s School of Foreign Service.",
        "In the mid-1960s he was a favorite professor of then-future U.S. President Bill Clinton and wrote the faculty letter of recommendation that helped Clinton win a Rhodes Scholarship.",
        "Professor Giles joined Delta Phi Epsilon Professional Foreign Service Fraternity as a faculty brother in 1949. For several years in the 1950s he served as National Vice President for Alpha Chapter of the fraternity, and in the early 1960s he was a founding trustee of the Delta Phi Epsilon Foundation for Foreign Service Education.",
        "Throughout the 1950s, 1960s, 1970s, and 1980s, Brother Giles regularly participated as a faculty inquisitor in the fraternity’s initiation proceedings, often scheduling his course examinations for the day following the initiations.",
        "In 1960, when Georgetown University ordered all fraternities to give up their chapter houses, Giles organized and led a faculty committee in hopes of persuading the university to reconsider.",
        "In short, Giles was a principal reason the DPE House was able to endure for the next sixty years."
      ]
    },
    {
      name: "Joseph “Joe” LeMoine",
      bio: [
        "Joseph “Joe” LeMoine served with the U.S. Army in the Pacific theater during World War II. After the war, he worked for the Army Security Agency in Washington, including a period working for McGeorge Bundy. He attended Georgetown University’s School of Foreign Service, graduating in 1954, then joined the School of Foreign Service faculty in 1955. He later transferred to Georgetown’s Business School, where he taught accounting and tax law until his retirement in 1986, serving as an assistant professor.",
        "LeMoine became a certified public accountant and maintained an active practice throughout his life. Early in his career as a CPA, he partnered with two Delta Phi Epsilon (DPE) alumni who had taught him at Georgetown—Edward White and Cecil Yates—who also helped bring him onto the accounting faculty.",
        "He entered Delta Phi Epsilon in 1956 while teaching at Georgetown. Though not an undergraduate pledge, he is recorded as a pledge initiate on the 72nd Line. He went on to serve the fraternity in multiple leadership roles, including Treasurer, President (beginning January 1983), and Trustee of the DPE Foundation from 1960 to 1994. Throughout his decades of service, LeMoine remained an engaged member and mentor to many brothers, balancing his academic post, professional practice, and fraternity responsibilities with sustained commitment."
      ]
    },
    {
      name: "Andrew Jay Garry",
      bio: [
        "Andrew Jay Garry joined Delta Phi Epsilon fraternity as a pledge initiate on the 77th Line. Following graduation in 1958 from the Georgetown University School of Foreign Service, where he had been president of the Alpha Chapter of the DPE Foreign Service Fraternity during his senior year, Jay enlisted in the U.S. Navy, where he trained as a pilot. He served as a naval pilot both before and during the Vietnam War and retired from the Navy as a Commander.",
        "After his military career, he briefly worked for Piper Aircraft International. He subsequently joined Merrill Lynch as a retail broker and later office manager from 1970 until his retirement in 2004.",
        "Jay served as Vice President of the Delta Phi Epsilon Foundation for Foreign Service Education from January 1983 until 2005."
      ]
    },
    {
      name: "Henry Cunningham",
      bio: [
        "Henry Cunningham attended Georgetown University, earning a Bachelor's degree in Economics in 1938 and the first of two law degrees in 1941. He subsequently received a Master's degree in Business Administration from George Washington University.",
        "In 1945, Henry became a Professor of Economic Administration at Georgetown University and was subsequently appointed the Acting Dean of the School of Business Administration, a position he held until 1960.",
        "While teaching at Georgetown, he became a faculty brother of Delta Phi Epsilon Fraternity. From 1956 to 1960 he was the National Vice President of Delta Phi Epsilon Professional Foreign Service Fraternity. In 1959 Henry joined with fellow faculty brothers John Leahy and Joe LeMoine to organize what would become the Delta Phi Epsilon Foundation for Foreign Service Education.",
        "Henry was principally responsible for recruiting the undergraduate and alumni brothers included as the initial organizers and creating the structural composition of the trustees. Prior to the actual formation of the Foundation, Henry transferred to American University to become an Assistant Professor and Assistant Dean of Business Administration. Although Henry was never an officer or trustee of the Foundation, he was instrumental in its initial organization, structure and the composition of its members.",
        "In 1963, Henry left American University to become an Associate Professor at the University of Baltimore. Throughout his professional career, Henry also worked in numerous capacities, including as an analyst at the Interstate Commerce Commission, a consultant to both the State Department and Defense Department and as an instructor at the Army Logistics Center."
      ]
    },
    {
      name: "Reginald “Reggie” Tyson",
      bio: [
        "Reginald “Reggie” Tyson entered Georgetown University’s School of Foreign Service in the spring of 1975 and graduated in the spring of 1979. He joined Delta Phi Epsilon fraternity as a pledge initiate on the 113th Line.",
        "In his senior year, Reggie served as President of Alpha Chapter.",
        "Reggie succeeded Joe LeMoine as both a Trustee and the President of the Delta Phi Epsilon Foundation for Foreign Service Education, representing a changing of the guard within the Foundation. He served as Trustee and President until his death in 2020. While President, Reggie worked with Foundation Treasurer Brother Terry Boyle to pursue acquisition of the apartment building next to the Alpha House so the Foundation could generate rental income and secure a headquarters.",
        "When, in 2018-2020, the University required nearly all undergraduates to live on campus, precluding continued use of the Alpha House as a fraternity residence, Reggie supported donating the house to the Foundation and its subsequent sale. Confidence in his judgment and character encouraged many brothers to support the donation.",
        "Reggie was a big man in stature and character. In his later years he worked in many capacities, especially as both a bouncer and owner of several dance clubs in Washington, D.C."
      ]
    },
    {
      name: "Kenneth W. Bleakley",
      bio: [
        "Kenneth W. Bleakley graduated from Georgetown University’s School of Foreign Service in 1963 and later earned a master’s degree from American University.",
        "He was initiated in 1960 on the 81st Line of Alpha Chapter of Delta Phi Epsilon Professional Foreign Service Fraternity and later served as the fraternity’s National President.",
        "Following graduation, Ken joined the U.S. Foreign Service, embarking on a distinguished 29-year career. His assignments included Deputy Chief of Mission in San Salvador, Director of U.S. Operations in Central America, Director of the U.S. International Refugee Program, and Senior Deputy U.S. Coordinator for International Communications and Information Policy under President George H. W. Bush. He also served as President of the American Foreign Service Association.",
        "After retiring from the Foreign Service, Ken co-founded and served as past president of Fonemed LLC, which provides nurse advice services throughout North America and the Caribbean. In 2023 he became a trustee of the Delta Phi Epsilon Foundation for Foreign Service Education and designed its initial scholarship program, now named in his honor."
      ]
    },
    {
      name: "John F. “Jack” Herrity",
      bio: [
        "John F. “Jack” Herrity graduated from both Georgetown University’s School of Foreign Service and Georgetown University’s School of Law.",
        "After finishing law school he served a tour of duty with the U.S. Coast Guard. Though trained as a lawyer, Jack spent the remainder of his professional life working in the insurance business in Fairfax County, Virginia.",
        "Jack is best remembered for his political leadership. From 1975 to 1987 he chaired the Fairfax County Board of Supervisors and was credited with guiding the county’s remarkable growth. He dominated Northern Virginia politics for decades, had the Fairfax County Parkway named in his honor in 1995, and ran unsuccessfully for governor of Virginia in 2001.",
        "Jack joined Alpha Chapter of Delta Phi Epsilon as an undergraduate pledge initiate, though the precise line and year were not recorded.",
        "He was one of the original trustees of the Delta Phi Epsilon Foundation for Foreign Service Education, serving from 1960 to 1962 in the years before incorporation."
      ]
    },
    {
      name: "Rocco E. Porreco",
      bio: [
        "After completing high school in Colorado, Rocco Porreco entered a seminary intending to become a Jesuit priest. When the United States entered World War II, he left the seminary to join the Army, serving as a combat medic under General George Patton and earning the Silver Star, Bronze Star, and Purple Heart.",
        "After the war, Rocco returned to Washington, D.C., completed his education, and ultimately earned a Ph.D. in Philosophy at Catholic University while working as an intelligence analyst at the State Department.",
        "Upon receiving his doctorate, he served as a philosophy professor at Catholic University before joining Georgetown University’s School of Foreign Service faculty. He became chair of Georgetown’s Philosophy Department and later served as dean of both the Graduate School and the Summer School.",
        "Rocco’s interests extended beyond teaching. He founded the Georgetown University Community Action Program (GUCAP) and the Community Scholars Program for inner-city youth, and co-founded the Georgetown University Employee Credit Union.",
        "He joined Delta Phi Epsilon as a faculty brother in 1961 with the 83rd Line and became one of the original faculty trustees of the Delta Phi Epsilon Foundation for Foreign Service Education, continuing his service from the Foundation’s incorporation in 1962 until his death in 2015."
      ]
    }
  ]

  const toggleHonoree = (index: number) => {
    setActiveHonorees((current) => {
      const updated = new Set(current)
      const partnerIndex = index % 2 === 0 ? index + 1 : index - 1
      const indicesToToggle = [index]

      if (partnerIndex >= 0 && partnerIndex < hallOfFameHonorees.length) {
        indicesToToggle.push(partnerIndex)
      }

      const isOpen = updated.has(index)

      indicesToToggle.forEach((i) => {
        if (isOpen) {
          updated.delete(i)
        } else {
          updated.add(i)
        }
      })

      return updated
    })
  }

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
            <Link href="/" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Home
            </Link>
            <Link href="/programs" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Programs
            </Link>
            <Link href="/facilities" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Facilities
            </Link>
            <Link href="/scholarships" className="text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl">
              Scholarships
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
            <Link href="/scholarships" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Scholarships
            </Link>
            <Link href="/policies" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Policies
            </Link>
            <Link href="/programs" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Programs
            </Link>
            <Link href="/facilities" className="block py-2 text-[#d4af36] hover:text-[#b08d28] transition duration-300 text-xl text-center">
              Facilities
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
            <p>The Foundation was originally formed in 1960 by student, alumni and faculty Brothers of Alpha Chapter of Delta Phi Epsilon Fraternity.</p>
            <p>The following individuals served as trustees of the unincorporated Foundation: Walter Giles, John Herrity, Charles Kalevala, John Koch, John Leahy, Joseph LeMoine, Vincent Norelli, and Dirck Teller.</p>
            <p>The Foundation was later incorporated with the adoption of a Certificate of Incorporation on May 16, 1962 and filed in the District of Columbia on May 23, 1962.</p>
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
                  <li>Vincent P Norelli</li>
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
            <p>By December 2005, the remaining four of the original Trustees (vonStroebel, Walsh, Norelli, and Porreco) died or resigned and were replaced by younger Alpha Chapter alumni brothers. All Trustees were alumni brothers thereafter. Brother Boyle remained as the sole constant throughout this period and until his retirement in 2021 as Treasurer upon attaining age 80.</p>
            <p>No additional fundraising activities were conducted during the ensuing periods. The primary focus became educational programming. For example, between October 2013 and February 2019, the Foundation sponsored 19 educational lectures. Since the onset of the Covid-19 pandemic additional lectures have been curtailed but are now expected to be renewed.</p>
            <p>Following a decision by Georgetown University to require most undergraduate students to reside in university housing, maintenance of the Alpha Chapter fraternity house as a residence for undergraduate brothers became untenable. The undergraduate brothers of Alpha Chapter, with the support of a substantial number of alumni Alpha Chapter brothers who expressed an opinion, decided to donate the house to the Foundation with the expectation of a sale. Due to the tax exempt status of the Foundation, a sale by the Foundation meant that the sales proceeds would not be reduced by taxes. Without the donation a sale would be subject to substantial taxes.</p>
            <p>The fraternity house was donated to the Foundation and sold for $2,650,000. After selling expenses, the net proceeds equaled slightly less than $2,270,000. The proceeds were held in escrow pending review by the D.C. Office of the Attorney General and ultimate approval by a judge on the D.C. Municipal Court. The Trustees committed to hold the proceeds in interest bearing assets for use in accordance with an Alpha House Fund Plan (the House Plan) subject to approval by the Alpha Chapter Brothers. On several occasions during the pendency of the review, a substantial majority of the Alpha Chapter brothers voted to reaffirm the donation to the Foundation and ratified the House Plan. A copy of the House Plan is included on the website. Final review and approval was granted and the escrowed funds were released to the Foundation on August 12, 2024. </p>
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
            <p>At the time final approval was granted only Brothers Stewart, Picozzi and Eriksen continued to serve. Newly appointed trustees include Carlos Roa, Kenneth W Bleakley (subsequently deceased), Albert L Grasso and Timothy J Rosenberger. The current Board of Trustees has commenced to fulfill the original goals and objectives of the Foundation. The current Trustees are also committed to honoring the terms of the House Plan and have set aside the net proceeds of $2,270,000 plus the additional $300,000 previously accumulated by Brother Terry Boyle in a separate endowment fund. The fund is presently invested in U.S. Treasury obligations. The principal is being held for compliance with the House Plan. Interest income thereof will be used to support other Foundation activities. Within days of receiving the sale proceeds, the Foundation created its first scholarship program. The Foundation has also announced the creation of two additional scholarship programs to commence in 2025. A Program Committee has been created and arrangements are being made to restart the lecture series suspended during the Covid-19 pandemic. Additional information on both the Scholarship Programs and the lecture Program can be found elsewhere on the website.</p>
        
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">All Those Who Have Ever Served as Trustees</h2>
  <div className="flex justify-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
      <ul className="pl-6 space-y-2">
        <li>Kenneth Bleakley 2023 - 2024</li>
        <li>James Condren 1962 - 1970</li>
        <li>Eduardo (Eddie) Deschapelles 2025 - present</li>
        <li>Matthew Ellison 2020 - 2023</li>
        <li>Michael Eriksen 2005 - present</li>
        <li>Walter Giles 1960 - 1962</li>
        <li>Francis Gorman 1989 - 1994</li>
        <li>Albert Grasso 2023 - present</li>
        <li>John Herity 1960 - 1962</li>
        <li>Charles Kaleta 1960 - 1962</li>
      </ul>
      <ul className="pl-6 space-y-2">
        <li>John Koch 1960 - 1962</li>
        <li>Marcus King 2005 - 2023</li>
        <li>John Leahy 1960 - 1970</li>
        <li>Joseph LeMoine 1960 - 1994</li>
        <li>Matthew Mixa 2005 - 2023</li>
        <li>Vincent Norelli 1960 - 2005</li>
        <li>Philip O&apos;Reilly 1962 - 1989</li>
        <li>Joseph Picozzi 2020 - present</li>
        <li>Stratton Poland 2020 - 2023</li>
        <li>Rocco Porecco 1962 - 2013</li>
      </ul>
      <ul className="pl-6 space-y-2">
        <li>Louis Postiglione 1962 - 2005</li>
        <li>Carlos F. Roa 2023 - present</li>
        <li>Timothy Rosenberger 2023 - present</li>
        <li>Thomas Stewart 2020 - present</li>
        <li>Andrew Sullivan 2005 - 2020</li>
        <li>Dirck Teller 1960 - 1962</li>
        <li>Reginald Tyson 1994 - 2019</li>
        <li>James-Michael von Stroebel 1960 - 2005</li>
        <li>Bailey Walsh 1962 - 2005</li>
      </ul>
    </div>
            </div>        
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">
            Officers of the DPE Foundation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "President",
                history: [
                  { years: "1983 - 1994", name: "Joseph F. LeMoine" },
                  { years: "1994 - 2018", name: "Reginald M. Tyson" },
                  { years: "2018 - 2022", name: "Matthew G. Ellison" },
                  { years: "2022 - present", name: "Joseph S. Picozzi" },
                ],
              },
              {
                title: "Vice-President",
                history: [
                  { years: "1983 - 2005", name: "Andrew J. Garry" },
                  { years: "2005 - present", name: "Patrick Hall" },
                ],
              },
              {
                title: "Secretary",
                history: [
                  { years: "1983 - present", name: "James M vonStroebel" },
                ],
              },
              {
                title: "Treasurer",
                history: [
                  { years: "2021 - 2023", name: "Picozzi" },
                  { years: "2024 - present", name: "Grasso" },
                ],
              },
            ].map((officer) => (
              <div key={officer.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-3 text-[#d4af36] text-center">{officer.title}</h3>
                <ul className="space-y-2 text-gray-800 dark:text-gray-200 text-center">
                  {officer.history.map((entry) => (
                    <li key={`${officer.title}-${entry.years}`}>
                      <span className="block font-medium">{entry.name}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{entry.years}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 text-center text-black dark:text-white">Foundation Hall of Fame</h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 text-center mb-6">
            The Foundation recognizes brothers who have made a significant contribution to the Foundation and Fraternity. A brief biographical sketch is included for each honoree.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {hallOfFameHonorees.map((honoree, index) => {
              const contentId = `hall-of-fame-${index}`
              return (
                <div key={honoree.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  <button
                    type="button"
                    onClick={() => toggleHonoree(index)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-gray-900 text-left transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    aria-expanded={activeHonorees.has(index)}
                    aria-controls={contentId}
                  >
                    <span className="flex items-center space-x-3">
                      {activeHonorees.has(index) ? (
                        <FolderOpen className="h-6 w-6 text-[#d4af36]" />
                      ) : (
                        <Folder className="h-6 w-6 text-[#d4af36]" />
                      )}
                      <span className="text-lg font-semibold text-[#d4af36]">
                        {honoree.name}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-[#d4af36]">
                      {activeHonorees.has(index) ? "Hide Biography" : "View Biography"}
                    </span>
                  </button>
                  {activeHonorees.has(index) && (
                    <div
                      id={contentId}
                      className="px-6 py-4 space-y-3 text-gray-800 dark:text-gray-200"
                    >
                      {honoree.bio.map((paragraph, paragraphIndex) => (
                        <p key={`${honoree.name}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Current Developments</h2>
          <div className="max-w-4xl mx-auto">
            <iframe
              src="/6-9-10 Status Ltr to Brotherhood.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
              className="w-full min-h-screen border-0 shadow-lg rounded-lg"
              style={{ 
                border: 'none', 
                outline: 'none',
                background: 'white',
                minHeight: '800px'
              }}
              title="Status Letter to Brotherhood"
            />
            <div className="mt-4 text-center">
              <Link 
                href="/6-9-10 Status Ltr to Brotherhood.pdf" 
                target="_blank" 
                className="inline-block font-serif font-semibold text-[#d4af36] hover:text-[#b08d28] transition duration-300 underline"
              >
                Download PDF
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">Foundation Officers</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { name: "Joseph S. Picozzi", role: "President", chapter: "Alpha Chapter", line: "192 Line" },
              { name: "Patrick Hall", role: "Vice President", chapter: "Alpha Chapter", line: "74 Line" },
              { name: "Carlos F. Roa", role: "Secretary", chapter: "Alpha Chapter", line: "189 Line" },
              { name: "Albert L. Grasso", role: "Treasurer", chapter: "Alpha Chapter", line: "92 Line" },
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
              { name: "Eduardo (Eddie) Deschapelles", role: "Alpha Chapter", denomination: "119 Line", occupation: "Finance" },
              { name: "Michael D. Eriksen", role: "Alpha Chapter", denomination: "99 Line", occupation: "Attorney" },
              { name: "Albert L. Grasso", role: "Alpha Chapter", denomination: "92 Line", occupation: "Attorney" },
              { name: "Joseph S. Picozzi", role: "Alpha Chapter", denomination: "192 Line", occupation: "State Senator" },
              { name: "Carlos F. Roa", role: "Alpha Chapter", denomination: "189 Line", occupation: "Editor" },
              { name: "Timothy J. Rosenberger", role: "Alpha Chapter", denomination: "206 Line", occupation: "Attorney" },
              { name: "Thomas M. Stewart", role: "Alpha Chapter", denomination: "193 Line", occupation: "Economist" },
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
  <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-black dark:text-white">
    Trustee Biographies
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Eduardo (Eddie) Deschapelles</h3>
      <p>Georgetown University: BSFS – cum laude (1982)</p>
      <p>Harvard University: MBA – 1988</p>
      <p>Adjunct Professor: Georgetown University (2017- present)</p>
      <p>Banking: 1982 – 2004 (Merrill Lynch, Citibank, Chase, Bank of Boston)</p>
      <p>Hedge Funds: 2004-2017 (Aspect Capital, Permal Group)</p>
      <p>Private Equity: 2017-2022 (AES Infrastructure Advisors)</p>
      <p>Board Member: subsidiary companies of Citibank, Aspect, Bank of Boston</p>
      <p>Seed Investor: SaaS rating software, gaming app, liquor, door fixtures</p>
      <p>Martial Arts: black belt in shotokan karate</p>
      <p>Married to Cecilia for 30+ years; 3 adult children</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Michael D. Eriksen</h3>
      <p>Georgetown University: BSFS in International Economic Affairs (1972)</p>
      <p>University of Florida College of Law: JD (1980); Law Review Editor</p>
      <p>President, Alpha Chapter, Delta Phi Epsilon (1971-72)</p>
      <p>U.S. Marine ground officer (1972-77)</p>
      <p>Civil trial practice, West Palm Beach, FL (1981-present)</p>
      <p>
        Dual Board-certified by the Florida Bar in Civil Trial Law and Admiralty & Maritime Law
      </p>
      <p>Admiralty Proctor, Maritime Law Association of the United States</p>
      <p>Fisherman</p>
      <p>Married to Kerry for over 3 decades; 4 adult children</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Albert L. Grasso</h3>
      <p>Georgetown University: BSFS (1968); JD (1973); LLM (1974)</p>
      <p>Past President - Chuhak & Tecson</p>
      <p>Associate Professor - Roosevelt University</p>
      <p>Author - 21 Books and Articles</p>
      <p>Lecturer - 50 states and 10 countries</p>
      <p>World Traveler - 90 countries</p>
      <p>Sergeant - US Army</p>
      <p>Organizer - Search for Genghis Khan</p>
      <p>Amateur Genealogist</p>
      <p>Collector - Art, stamps and sundry</p>
      <p>Married to Gwen for 50 years</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Joseph S. Picozzi</h3>
      <p>Georgetown University: AB in Government (2017)</p>
      <p>George F. Baker Scholar; Member, 192nd line of Delta Phi Epsilon</p>
      <p>Founded Politics Club at Holy Ghost Preparatory School</p>
      <p>Appointed to Philadelphia Youth Commission by City Councilman Brian O&apos;Neill</p>
      <p>Eagle Scout</p>
      <p>Former Aide to Speaker of the House Kevin McCarthy</p>
      <p>Former Chief of Staff, Manhattan Institute</p>
      <p>
        State Senator, Northeast Philadelphia (youngest in Pennsylvania; first Republican
        elected to represent Philadelphia in the State Senate since 1996)
      </p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Carlos F. Roa</h3>
      <p>Georgetown University: BSFS (2015)</p>
      <p>Visiting Fellow & Director of Keystone Initiative - Danube Institute</p>
      <p>Former Executive Editor - The National Interest</p>
      <p>Associate Fellow: Institute for Peace & Diplomacy</p>
      <p>Analyst: Center for Int&apos;l Relations & Sustainable Development</p>
      <p>Research Assistant: Potomac Foundation</p>
      <p>Author 12 Articles</p>
      <p>Young Global Leader: Nizami Ganjavi Int&apos;l Center</p>
      <p>Crypto Investor</p>
      <p>Board of Directors - Various Startups</p>
      <p>Aspiring Sitcom Writer</p>
    </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Timothy J. Rosenberger</h3>
      <p>Georgetown University: AB in English (2016)</p>
      <p>United Lutheran Seminary: MDiv (2018)</p>
      <p>Rawlings School of Divinity: DMin (2020)</p>
      <p>Universitas Wien: LLM (2022)</p>
      <p>Stanford University: JD/MBA (2023)</p>
      <p>Fellow: Manhattan Institute, Stanford University</p>
      <p>Fellow: Glen College of Public Affairs, Ohio State University</p>
      <p>Founding COO: Verbum Labs</p>
      <p>Chaplain: Cleveland Division of Police</p>
      <p>Parish Pastor</p>
      <p>Consultant: McKinsey</p>
      <p>Media Consultant</p>
      <p>Chapter President: Federalist Society</p>
      <p>Amateur Musician: Hermit Club</p>
    </div>
  
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-2 text-[#d4af36]">Thomas M. Stewart</h3>
      <p>Georgetown University: BSFS (2019)</p>
      <p>George Mason University: MA in Economics (2025)</p>
      <p>Energy Data Analyst: IMG-Crown</p>
      <p>Asset Manager: Soltage</p>
      <p>Econometrics Intern: Brown Williams Moorhead & Quinn</p>
      <p>Intern: US Department of Commerce</p>
      <p>Eagle Scout</p>
      <p>Future Mining Executive</p>
    </div>
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
