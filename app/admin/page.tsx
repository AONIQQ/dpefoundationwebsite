'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Textarea } from "@/app/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Download, Moon, Sun, FileText, Save, Edit, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ScholarshipSubmission {
  id: number
  full_name: string
  application_file_path: string
  attendance_file_path: string
  test_completion_file_path: string
  submission_time: string
  reviewed: boolean
  status: string
  admin_notes: string
}

interface ContactSubmission {
  id: number
  full_name: string
  email: string
  message: string
  submission_time: string
}

export default function AdminDashboard() {
  const [scholarshipSubmissions, setScholarshipSubmissions] = useState<ScholarshipSubmission[]>([])
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([])
  const [error, setError] = useState<string | null>(null)
  const [scholarshipSortField, setScholarshipSortField] = useState<keyof ScholarshipSubmission>('submission_time')
  const [contactSortField, setContactSortField] = useState<keyof ContactSubmission>('submission_time')
  const [scholarshipSortDirection, setScholarshipSortDirection] = useState<'asc' | 'desc'>('desc')
  const [contactSortDirection, setContactSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingNotes, setEditingNotes] = useState<{ id: number, notes: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchSubmissions = useCallback(async () => {
    setError(null)
    try {
      console.log('Fetching scholarship submissions...')
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarship_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (scholarshipError) throw scholarshipError

      console.log('Scholarship submissions fetched:', scholarshipData)
      setScholarshipSubmissions(scholarshipData?.map(submission => ({
        ...submission,
        status: submission.status || 'Submitted - Unchecked',
        admin_notes: submission.admin_notes || ''
      })) || [])

      console.log('Fetching contact form submissions...')
      const { data: contactData, error: contactError } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (contactError) throw contactError

      console.log('Contact form submissions fetched:', contactData)
      setContactSubmissions(contactData || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch submissions')
    }
  }, [supabase])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  function downloadCSV(type: 'scholarship' | 'contact') {
    let headers: string[]
    let data: (string | number | boolean)[][]

    if (type === 'scholarship') {
      headers = ['Full Name', 'Application File', 'Attendance File', 'Test Completion File', 'Submitted At', 'Reviewed', 'Status', 'Admin Notes']
      data = scholarshipSubmissions.map(s => [
        s.full_name,
        s.application_file_path,
        s.attendance_file_path,
        s.test_completion_file_path,
        new Date(s.submission_time).toLocaleString(),
        s.reviewed ? 'Yes' : 'No',
        s.status,
        `"${s.admin_notes.replace(/"/g, '""')}"`
      ])
    } else {
      headers = ['Full Name', 'Email', 'Message', 'Submitted At']
      data = contactSubmissions.map(s => [
        s.full_name,
        s.email,
        `"${s.message.replace(/"/g, '""')}"`,
        new Date(s.submission_time).toLocaleString()
      ])
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${type}_submissions.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleScholarshipSort = (field: keyof ScholarshipSubmission) => {
    if (field === scholarshipSortField) {
      setScholarshipSortDirection(scholarshipSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setScholarshipSortField(field)
      setScholarshipSortDirection('asc')
    }
  }

  const handleContactSort = (field: keyof ContactSubmission) => {
    if (field === contactSortField) {
      setContactSortDirection(contactSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setContactSortField(field)
      setContactSortDirection('asc')
    }
  }

  const sortSubmissions = <T extends ScholarshipSubmission | ContactSubmission>(
    submissions: T[],
    sortField: keyof T,
    sortDirection: 'asc' | 'desc'
  ): T[] => {
    return [...submissions].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    }).filter(submission => 
      Object.values(submission).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const sortedScholarshipSubmissions = sortSubmissions(scholarshipSubmissions, scholarshipSortField, scholarshipSortDirection)
  const sortedContactSubmissions = sortSubmissions(contactSubmissions, contactSortField, contactSortDirection)

  const handleFileClick = (filePath: string, bucket: string) => {
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl
    setSelectedFile(publicUrl)
  }

  const handleReviewedChange = (id: number, reviewed: boolean) => {
    setScholarshipSubmissions(prevSubmissions =>
      prevSubmissions.map(submission =>
        submission.id === id ? { ...submission, reviewed } : submission
      )
    )
  }

  const handleStatusChange = (id: number, status: string) => {
    setScholarshipSubmissions(prevSubmissions =>
      prevSubmissions.map(submission =>
        submission.id === id ? { ...submission, status } : submission
      )
    )
  }

  const handleAdminNotesChange = (id: number, admin_notes: string) => {
    setEditingNotes({ id, notes: admin_notes })
  }

  const saveAdminNotes = () => {
    if (editingNotes) {
      setScholarshipSubmissions(prevSubmissions =>
        prevSubmissions.map(submission =>
          submission.id === editingNotes.id ? { ...submission, admin_notes: editingNotes.notes } : submission
        )
      )
      setEditingNotes(null)
      setIsDialogOpen(false)
      toast.success('Admin notes updated. Remember to save changes in the top right to update the records.')
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    toast.info('Saving changes...', { autoClose: false, toastId: 'saving' })

    try {
      const { error } = await supabase
        .from('scholarship_submissions')
        .upsert(scholarshipSubmissions, { onConflict: 'id' })

      if (error) throw error

      toast.dismiss('saving')
      toast.success("Changes have been saved successfully")
      await fetchSubmissions() // Refresh data after saving
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.dismiss('saving')
      toast.error(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
        // Optionally, you can show an error message to the user
        // toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally, you can show an error message to the user
      // toast.error('An error occurred during logout. Please try again.');
    }
  };

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-serif">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <header className="bg-white dark:bg-black py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-10 w-auto sm:h-12 md:h-14"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleLogout}
              className="bg-[#d4af36] hover:bg-[#b08d28] text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-[#d4af36] hover:text-[#b08d28] transition duration-300"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8 bg-white dark:bg-gray-800 border-[#d4af36]">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl font-bold text-black dark:text-white">Scholarship Submissions</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 text-black dark:text-white bg-white dark:bg-gray-700"
              />
              <div className="flex space-x-2">
                <Button onClick={() => downloadCSV('scholarship')} className="bg-[#d4af36] hover:bg-[#b08d28] text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving} 
                  className="bg-[#d4af36] hover:bg-[#b08d28] text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {sortedScholarshipSubmissions.length === 0 ? (
              <p className="text-black dark:text-white">No submissions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleScholarshipSort('full_name')} className="cursor-pointer text-black dark:text-white">
                      Full Name {scholarshipSortField === 'full_name' && (scholarshipSortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-black dark:text-white">Files</TableHead>
                    <TableHead onClick={() => handleScholarshipSort('submission_time')} className="cursor-pointer text-black dark:text-white">
                      Submitted At {scholarshipSortField === 'submission_time' && (scholarshipSortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-black dark:text-white">Reviewed</TableHead>
                    <TableHead className="text-black dark:text-white">Status</TableHead>
                    <TableHead className="text-black dark:text-white">Admin Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScholarshipSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="text-black dark:text-white">{submission.full_name}</TableCell>
                      <TableCell className="text-black dark:text-white">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileClick(submission.application_file_path, 'applications')}
                            className="text-[#d4af36] hover:text-[#b08d28]"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Application</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileClick(submission.attendance_file_path, 'proofs')}
                            className="text-[#d4af36] hover:text-[#b08d28]"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Attendance</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileClick(submission.test_completion_file_path, 'fsot')}
                            className="text-[#d4af36] hover:text-[#b08d28]"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Test Completion</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-black dark:text-white">{new Date(submission.submission_time).toLocaleString()}</TableCell>
                      <TableCell className="text-black dark:text-white">
                        <Checkbox
                          checked={submission.reviewed}
                          onCheckedChange={(checked) => handleReviewedChange(submission.id, checked as boolean)}
                          className="ml-0"
                        />
                      </TableCell>
                      <TableCell className="text-black dark:text-white">
                        <Select
                          value={submission.status}
                          onValueChange={(value) => handleStatusChange(submission.id, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Submitted - Unchecked">Submitted - Unchecked</SelectItem>
                            <SelectItem value="Approved - Paid">Approved - Paid</SelectItem>
                            <SelectItem value="Approved - Payment Pending">Approved - Payment Pending</SelectItem>
                            <SelectItem value="Denied - Reasoning Provided">Denied - Reasoning Provided</SelectItem>
                            <SelectItem value="Denied - Final Decision">Denied - Final Decision</SelectItem>
                            <SelectItem value="Waiting for Committee Review">Waiting for Committee Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-black dark:text-white">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              {submission.admin_notes ? submission.admin_notes.substring(0, 20) + '...' : 'Add Notes'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Admin Notes</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              value={editingNotes?.id === submission.id ? editingNotes.notes : submission.admin_notes}
                              onChange={(e) => handleAdminNotesChange(submission.id, e.target.value)}
                              placeholder="Add admin notes here..."
                              className="min-h-[100px]"
                            />
                            <Button onClick={saveAdminNotes} className="mt-4">Save Notes</Button>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-[#d4af36]">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl font-bold text-black dark:text-white">Contact Form Submissions</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 text-black dark:text-white bg-white dark:bg-gray-700"
              />
              <Button onClick={() => downloadCSV('contact')} className="bg-[#d4af36] hover:bg-[#b08d28] text-white">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {sortedContactSubmissions.length === 0 ? (
              <p className="text-black dark:text-white">No submissions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleContactSort('full_name')} className="cursor-pointer text-black dark:text-white">
                      Full Name {contactSortField === 'full_name' && (contactSortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead onClick={() => handleContactSort('email')} className="cursor-pointer text-black dark:text-white">
                      Email {contactSortField === 'email' && (contactSortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-black dark:text-white">Message</TableHead>
                    <TableHead onClick={() => handleContactSort('submission_time')} className="cursor-pointer text-black dark:text-white">
                      Submitted At {contactSortField === 'submission_time' && (contactSortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContactSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="text-black dark:text-white">{submission.full_name}</TableCell>
                      <TableCell className="text-black dark:text-white">{submission.email}</TableCell>
                      <TableCell className="text-black dark:text-white">
                        <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                          {submission.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-black dark:text-white">{new Date(submission.submission_time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-4xl w-full h-5/6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">File Preview</h2>
                <Button onClick={() => setSelectedFile(null)} variant="ghost">
                  Close
                </Button>
              </div>
              <iframe src={selectedFile} className="w-full flex-grow" title="File Preview" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}