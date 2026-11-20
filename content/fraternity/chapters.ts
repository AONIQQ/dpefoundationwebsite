// Chapter Roll, from the Alpha Chapter Pledge Manual (2020), in the order printed.

export interface Chapter { name: string; installed: string; school?: string; university: string; location: string }

export const CHAPTERS: Chapter[] = [
  { name: 'Alpha', installed: 'January 25, 1920', school: 'School of Foreign Service', university: 'Georgetown University', location: 'Washington, D.C.' },
  { name: 'Beta', installed: 'December 30, 1920', school: 'School of Commerce, Accounts and Finance', university: 'New York University', location: 'New York, NY' },
  { name: 'Gamma', installed: 'May 22, 1922', school: 'School of Business Administration', university: 'Boston University', location: 'Boston, MA' },
  { name: 'Delta', installed: 'March 24, 1923', school: 'College of Commerce and Business Administration', university: 'University of Southern California', location: 'Los Angeles, CA' },
  { name: 'Epsilon', installed: 'April 1, 1923', school: 'College of Commerce', university: 'University of California', location: 'Berkeley, CA' },
  { name: 'Zeta', installed: 'February 3, 1924', school: 'School of Commerce and Finance', university: 'University of Detroit', location: 'Detroit, MI' },
  { name: 'Eta', installed: 'December 15, 1929', school: 'School of Government', university: 'The George Washington University', location: 'Washington, D.C.' },
  { name: 'Theta', installed: 'March 11, 1939', school: 'School of Business', university: 'Northwestern University', location: 'Evanston, IL' },
  { name: 'Iota', installed: 'April 29, 1939', university: 'University of Wisconsin', location: 'Madison, WI' },
  { name: 'Kappa', installed: 'November 13, 1949', university: 'Leland Stanford Junior University', location: 'Palo Alto, CA' },
  { name: 'Lambda', installed: 'October 14, 1949', university: 'The American Institute for Foreign Trade', location: 'Glendale, AZ' },
  { name: 'Mu', installed: 'November 19, 1955', university: 'Michigan State University', location: 'East Lansing, MI' },
  { name: 'Nu', installed: 'April 8, 1966', university: 'University of Michigan', location: 'Ann Arbor, MI' },
  { name: 'Xi', installed: 'May 25, 1966', university: 'Texas Technical College', location: 'Lubbock, TX' },
  { name: 'Omicron', installed: 'March 12, 1965', university: 'Occidental College', location: 'City of Los Angeles, CA' },
  { name: 'Pi', installed: 'December 3, 1967', university: 'The American University', location: 'Washington, D.C.' },
  { name: 'Rho', installed: 'February 19, 1971', university: 'California State College at Los Angeles', location: 'Los Angeles, CA' },
  { name: 'Sigma', installed: 'February 22, 1972', university: 'George Pepperdine University', location: 'Los Angeles, CA' },
  { name: 'Tau', installed: 'April 5, 1974', university: 'Loyola-Marymount University', location: 'Los Angeles, CA' },
  { name: 'Upsilon', installed: 'February 29, 1976', university: 'Arizona State University', location: 'Tempe, AZ' },
  { name: 'Phi', installed: 'April 25, 1975', university: 'University of South Carolina', location: 'Columbia, SC' },
  { name: 'Chi', installed: 'February 19, 2016', school: 'School of Public and International Affairs', university: 'James Madison University', location: 'Harrisonburg, VA' },
  { name: 'Psi', installed: 'November 16, 2008', school: 'School of International Studies', university: 'University of the Pacific', location: 'Stockton, CA' },
  { name: 'Omega', installed: 'February 20, 1976', university: 'Southern Methodist University', location: 'Dallas, TX' },
  { name: 'Beta Alpha', installed: 'April 1, 1962', university: 'Wayne State University', location: 'Detroit, MI' },
]
