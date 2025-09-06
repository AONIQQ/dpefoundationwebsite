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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/app/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Download, Moon, Sun, FileText, Edit, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface BaseSubmission {
  id: number
  full_name: string
  application_file_path: string
  attendance_file_path: string
  submission_time: string
  reviewed: boolean
  status: string
  admin_notes: string
}

interface BleakleySubmission extends BaseSubmission {
  test_completion_file_path: string
}

interface WeissSubmission extends BaseSubmission {
  intern_completion_file_path: string
}

interface ButtsSubmission extends BaseSubmission {
  additional_requirements_file_path: string
}

interface LeMoineSubmission extends BaseSubmission {
  resume_file_path: string
  transcript_file_path: string
  recommendation_file_path: string
}

type ScholarshipType = 'bleakley' | 'weiss' | 'butts' | 'lemoine'

interface ContactSubmission {
  id: number
  full_name: string
  email: string
  message: string
  submission_time: string
}

export default function AdminDashboard() {
  const [scholarshipType, setScholarshipType] = useState<ScholarshipType>('bleakley')
  const [bleakleySubmissions, setBleakleySubmissions] = useState<BleakleySubmission[]>([])
  const [weissSubmissions, setWeissSubmissions] = useState<WeissSubmission[]>([])
  const [buttsSubmissions, setButtsSubmissions] = useState<ButtsSubmission[]>([])
  const [lemoineSubmissions, setLeMoineSubmissions] = useState<LeMoineSubmission[]>([])
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<{ id: number, notes: string, scholarshipType: ScholarshipType } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchSubmissions = useCallback(async () => {
    try {
      console.log('Fetching scholarship submissions...')
      // Fetch Bleakley submissions
      const { data: bleakleyData, error: bleakleyError } = await supabase
        .from('bleakley_scholarship_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (bleakleyError) throw bleakleyError
      setBleakleySubmissions(bleakleyData || [])

      // Fetch Weiss submissions
      const { data: weissData, error: weissError } = await supabase
        .from('weiss_scholarship_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (weissError) throw weissError
      setWeissSubmissions(weissData || [])

      // Fetch Butts submissions
      const { data: buttsData, error: buttsError } = await supabase
        .from('butts_scholarship_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (buttsError) throw buttsError
      setButtsSubmissions(buttsData || [])

      // Fetch LeMoine submissions
      const { data: lemoineData, error: lemoineError } = await supabase
        .from('lemoine_scholarship_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (lemoineError) throw lemoineError
      setLeMoineSubmissions(lemoineData || [])

      // Fetch contact submissions
      const { data: contactData, error: contactError } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('submission_time', { ascending: false })

      if (contactError) throw contactError
      setContactSubmissions(contactData || [])

    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to fetch submissions')
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

  const getCurrentSubmissions = () => {
    switch (scholarshipType) {
      case 'bleakley':
        return bleakleySubmissions
      case 'weiss':
        return weissSubmissions
      case 'butts':
        return buttsSubmissions
      case 'lemoine':
        return lemoineSubmissions
      default:
        return []
    }
  }

  const downloadCSV = (type: ScholarshipType | 'contact') => {
    let data: (string | number | boolean)[][]
    let filename: string

    if (type === 'contact') {
      data = contactSubmissions.map(s => [
        s.full_name,
        s.email,
        s.message.replace(/"/g, '""'), // Escape quotes in the message
        new Date(s.submission_time).toLocaleString()
      ])
      filename = 'contact_submissions.csv'
    } else {
      const submissions = getCurrentSubmissions()
      if (type === 'lemoine') {
        data = (submissions as LeMoineSubmission[]).map(s => [
          s.full_name,
          s.application_file_path,
          s.resume_file_path,
          s.transcript_file_path,
          s.recommendation_file_path,
          new Date(s.submission_time).toLocaleString(),
          (s as BaseSubmission).reviewed ? 'Yes' : 'No',
          (s as BaseSubmission).status,
          (s as BaseSubmission).admin_notes?.replace(/"/g, '""') || ''
        ])
      } else {
        data = submissions.map(s => [
          s.full_name,
          s.application_file_path,
          s.attendance_file_path,
          type === 'bleakley' ? (s as BleakleySubmission).test_completion_file_path :
          type === 'weiss' ? (s as WeissSubmission).intern_completion_file_path :
          (s as ButtsSubmission).additional_requirements_file_path,
          new Date(s.submission_time).toLocaleString(),
          s.reviewed ? 'Yes' : 'No',
          s.status,
          s.admin_notes.replace(/"/g, '""') // Escape quotes in the notes
        ])
      }
      filename = `${type}_scholarship_submissions.csv`
    }

    const headers = type === 'contact' 
      ? ['Full Name', 'Email', 'Message', 'Submitted At']
      : type === 'lemoine'
      ? ['Full Name', 'Application File', 'Resume File', 'Transcript File', 'Recommendation File', 'Submitted At', 'Reviewed', 'Status', 'Admin Notes']
      : ['Full Name', 'Application File', 'Attendance File', `${getAdditionalFileLabel(type as ScholarshipType)}`, 'Submitted At', 'Reviewed', 'Status', 'Admin Notes']

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleFileClick = (filePath: string, scholarshipType: ScholarshipType, fileType: string) => {
    let bucket = ''
    
    if (scholarshipType === 'bleakley') {
      // Use original bucket names for Bleakley
      switch (fileType) {
        case 'application':
          bucket = 'applications'
          break
        case 'attendance':
          bucket = 'proofs'
          break
        case 'additional':
          bucket = 'fsot'
          break
      }
    } else if (scholarshipType === 'lemoine') {
      // Dedicated buckets for LeMoine
      switch (fileType) {
        case 'application':
          bucket = 'lemoine-applications'
          break
        case 'resume':
          bucket = 'lemoine-resumes'
          break
        case 'transcript':
          bucket = 'lemoine-transcripts'
          break
        case 'recommendation':
          bucket = 'lemoine-recommendations'
          break
        default:
          bucket = 'lemoine-applications'
      }
    } else {
      // Use new bucket names for Weiss and Butts
      bucket = `${scholarshipType}-${fileType === 'additional' ? 
        (scholarshipType === 'weiss' ? 'intern-proof' : 'requirements') : 
        fileType === 'attendance' ? 'attendance-proof' : 'applications'}`
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl
    setSelectedFile(publicUrl)
  }

  const handleStatusChange = async <T extends BaseSubmission>(id: number, status: string, setSubmissions: React.Dispatch<React.SetStateAction<T[]>>) => {
    const table = `${scholarshipType}_scholarship_submissions`
    try {
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => sub.id === id ? { ...sub, status } : sub)
      )

      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleReviewedChange = async <T extends BaseSubmission>(id: number, reviewed: boolean, setSubmissions: React.Dispatch<React.SetStateAction<T[]>>) => {
    const table = `${scholarshipType}_scholarship_submissions`
    try {
      const { error } = await supabase
        .from(table)
        .update({ reviewed: reviewed })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => sub.id === id ? { ...sub, reviewed } : sub)
      )

      toast.success(`Review status updated to ${reviewed ? 'reviewed' : 'not reviewed'}`)
    } catch (error) {
      console.error('Error updating review status:', error)
      toast.error('Failed to update review status')
    }
  }

  const saveAdminNotes = async () => {
    if (editingNotes) {
      const table = `${editingNotes.scholarshipType}_scholarship_submissions`
      try {
        const { error } = await supabase
          .from(table)
          .update({ admin_notes: editingNotes.notes })
          .eq('id', editingNotes.id)

        if (error) throw error

        // Update local state
        const updateSubmissions = <T extends BaseSubmission>(submissions: T[]) =>
          submissions.map(sub => sub.id === editingNotes.id ? { ...sub, admin_notes: editingNotes.notes } : sub)

        switch (editingNotes.scholarshipType) {
          case 'bleakley':
            setBleakleySubmissions(updateSubmissions)
            break
          case 'weiss':
            setWeissSubmissions(updateSubmissions)
            break
          case 'butts':
            setButtsSubmissions(updateSubmissions)
            break
          case 'lemoine':
            setLeMoineSubmissions(updateSubmissions)
            break
        }

        setEditingNotes(null)
        setIsDialogOpen(false)
        toast.success('Admin notes updated successfully')
      } catch (error) {
        console.error('Error saving admin notes:', error)
        toast.error('Failed to save admin notes')
      }
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        router.push('/admin/login')
      } else {
        toast.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    }
  }

  const getAdditionalFileLabel = (type: ScholarshipType) => {
    switch (type) {
      case 'bleakley':
        return 'FSOT Test'
      case 'weiss':
        return 'Intern Program'
      case 'butts':
        return 'Requirements'
      case 'lemoine':
        return 'Additional File'
      default:
        return 'Additional File'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-serif">
      <ToastContainer />
      
      <header className="bg-white dark:bg-black py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <Image 
              src={darkMode ? "/DPE-inverted.png" : "/DPE.png"} 
              alt="Delta Phi Epsilon logo" 
              width={240} 
              height={60} 
              className="h-14 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Button onClick={handleLogout} className="bg-[#d4af36] hover:bg-[#b08d28] text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-[#d4af36] hover:text-[#b08d28]"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scholarship Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={scholarshipType} onValueChange={(value: string) => setScholarshipType(value as ScholarshipType)}>
            <TabsList className="mb-4 flex flex-wrap gap-2 h-auto md:h-10 p-0 md:p-1 w-full items-stretch">
              <TabsTrigger value="bleakley" className="w-1/2 md:w-auto justify-center">Bleakley Scholarship</TabsTrigger>
              <TabsTrigger value="weiss" className="w-1/2 md:w-auto justify-center">Weiss Scholarship</TabsTrigger>
              <TabsTrigger value="butts" className="w-1/2 md:w-auto justify-center">Butts Scholarship</TabsTrigger>
              <TabsTrigger value="lemoine" className="w-1/2 md:w-auto justify-center">LeMoine Scholarship</TabsTrigger>
            </TabsList>

            {(['bleakley', 'weiss', 'butts', 'lemoine'] as ScholarshipType[]).map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <Input
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64"
                      />
                      <Button onClick={() => downloadCSV(type as ScholarshipType)} className="bg-[#d4af36]">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Files</TableHead>
                          <TableHead>Submitted At</TableHead>
                          <TableHead>Reviewed</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentSubmissions()
                          .filter(submission => 
                            submission.full_name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell>{submission.full_name}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  {scholarshipType === 'lemoine' ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          submission.application_file_path,
                                          scholarshipType as ScholarshipType,
                                          'application'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Application</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          (submission as LeMoineSubmission).resume_file_path,
                                          scholarshipType as ScholarshipType,
                                          'resume'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Resume</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          (submission as LeMoineSubmission).transcript_file_path,
                                          scholarshipType as ScholarshipType,
                                          'transcript'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Transcript</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          (submission as LeMoineSubmission).recommendation_file_path,
                                          scholarshipType as ScholarshipType,
                                          'recommendation'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Recommendation</span>
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          submission.application_file_path,
                                          scholarshipType as ScholarshipType,
                                          'application'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Application</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          submission.attendance_file_path,
                                          scholarshipType as ScholarshipType,
                                          'attendance'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">Attendance</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileClick(
                                          scholarshipType === 'bleakley' 
                                            ? (submission as BleakleySubmission).test_completion_file_path
                                            : scholarshipType === 'weiss'
                                            ? (submission as WeissSubmission).intern_completion_file_path
                                            : (submission as ButtsSubmission).additional_requirements_file_path,
                                          scholarshipType as ScholarshipType,
                                          'additional'
                                        )}
                                      >
                                        <FileText className="h-4 w-4" />
                                        <span className="sr-only">{getAdditionalFileLabel(scholarshipType)}</span>
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{new Date(submission.submission_time).toLocaleString()}</TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={submission.reviewed}
                                  onCheckedChange={(checked) => {
                                    switch (scholarshipType) {
                                      case 'bleakley':
                                        handleReviewedChange<BleakleySubmission>(submission.id, checked === true, setBleakleySubmissions)
                                        break
                                      case 'weiss':
                                        handleReviewedChange<WeissSubmission>(submission.id, checked === true, setWeissSubmissions)
                                        break
                                      case 'butts':
                                        handleReviewedChange<ButtsSubmission>(submission.id, checked === true, setButtsSubmissions)
                                        break
                                      case 'lemoine':
                                        handleReviewedChange<LeMoineSubmission>(submission.id, checked === true, setLeMoineSubmissions)
                                        break
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={submission.status}
                                  onValueChange={(value) => {
                                    switch (scholarshipType) {
                                      case 'bleakley':
                                        handleStatusChange<BleakleySubmission>(submission.id, value, setBleakleySubmissions)
                                        break
                                      case 'weiss':
                                        handleStatusChange<WeissSubmission>(submission.id, value, setWeissSubmissions)
                                        break
                                      case 'butts':
                                        handleStatusChange<ButtsSubmission>(submission.id, value, setButtsSubmissions)
                                        break
                                      case 'lemoine':
                                        handleStatusChange<LeMoineSubmission>(submission.id, value, setLeMoineSubmissions)
                                        break
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-[180px] md:w-[200px]">
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
                              <TableCell>
                                <Dialog open={isDialogOpen && editingNotes?.id === submission.id} onOpenChange={(open) => {
                                  setIsDialogOpen(open)
                                  if (!open) setEditingNotes(null)
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setEditingNotes({ 
                                          id: submission.id, 
                                          notes: submission.admin_notes,
                                          scholarshipType: scholarshipType
                                        })
                                        setIsDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      {submission.admin_notes 
                                        ? `${submission.admin_notes.substring(0, 20)}...` 
                                        : 'Add Notes'}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Admin Notes for {submission.full_name}</DialogTitle>
                                    </DialogHeader>
                                    <Textarea
                                      value={editingNotes?.notes || ''}
                                      onChange={(e) => setEditingNotes(prev => 
                                        prev ? { ...prev, notes: e.target.value } : null
                                      )}
                                      placeholder="Add admin notes here..."
                                      className="min-h-[200px]"
                                    />
                                    <DialogFooter>
                                      <Button onClick={saveAdminNotes} className="mt-4">
                                        Save Notes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    </div>

                    {/* Mobile list view */}
                    <div className="md:hidden space-y-4">
                      {getCurrentSubmissions()
                        .filter(submission => submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((submission) => (
                          <div key={submission.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-black dark:text-white">{submission.full_name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">{new Date(submission.submission_time).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {scholarshipType === 'lemoine' ? (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick(submission.application_file_path, scholarshipType as ScholarshipType, 'application')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Application</span>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick((submission as LeMoineSubmission).resume_file_path, scholarshipType as ScholarshipType, 'resume')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Resume</span>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick((submission as LeMoineSubmission).transcript_file_path, scholarshipType as ScholarshipType, 'transcript')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Transcript</span>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick((submission as LeMoineSubmission).recommendation_file_path, scholarshipType as ScholarshipType, 'recommendation')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Recommendation</span>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick(submission.application_file_path, scholarshipType as ScholarshipType, 'application')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Application</span>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleFileClick(submission.attendance_file_path, scholarshipType as ScholarshipType, 'attendance')}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Attendance</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileClick(
                                      scholarshipType === 'bleakley'
                                        ? (submission as BleakleySubmission).test_completion_file_path
                                        : scholarshipType === 'weiss'
                                        ? (submission as WeissSubmission).intern_completion_file_path
                                        : (submission as ButtsSubmission).additional_requirements_file_path,
                                      scholarshipType as ScholarshipType,
                                      'additional'
                                    )}
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">{getAdditionalFileLabel(scholarshipType)}</span>
                                  </Button>
                                </>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3 mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 dark:text-gray-200">Reviewed</span>
                                <Checkbox
                                  checked={submission.reviewed}
                                  onCheckedChange={(checked) => {
                                    switch (scholarshipType) {
                                      case 'bleakley':
                                        handleReviewedChange<BleakleySubmission>(submission.id, checked === true, setBleakleySubmissions)
                                        break
                                      case 'weiss':
                                        handleReviewedChange<WeissSubmission>(submission.id, checked === true, setWeissSubmissions)
                                        break
                                      case 'butts':
                                        handleReviewedChange<ButtsSubmission>(submission.id, checked === true, setButtsSubmissions)
                                        break
                                      case 'lemoine':
                                        handleReviewedChange<LeMoineSubmission>(submission.id, checked === true, setLeMoineSubmissions)
                                        break
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex-1 text-right">
                                <Select
                                  value={submission.status}
                                  onValueChange={(value) => {
                                    switch (scholarshipType) {
                                      case 'bleakley':
                                        handleStatusChange<BleakleySubmission>(submission.id, value, setBleakleySubmissions)
                                        break
                                      case 'weiss':
                                        handleStatusChange<WeissSubmission>(submission.id, value, setWeissSubmissions)
                                        break
                                      case 'butts':
                                        handleStatusChange<ButtsSubmission>(submission.id, value, setButtsSubmissions)
                                        break
                                      case 'lemoine':
                                        handleStatusChange<LeMoineSubmission>(submission.id, value, setLeMoineSubmissions)
                                        break
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-full max-w-[220px] ml-auto">
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
                              </div>
                            </div>
                            <div className="mt-3">
                              <Dialog open={isDialogOpen && editingNotes?.id === submission.id} onOpenChange={(open) => {
                                setIsDialogOpen(open)
                                if (!open) setEditingNotes(null)
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingNotes({ 
                                        id: submission.id, 
                                        notes: submission.admin_notes,
                                        scholarshipType: scholarshipType
                                      })
                                      setIsDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {submission.admin_notes 
                                      ? `${submission.admin_notes.substring(0, 20)}...` 
                                      : 'Add Notes'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Admin Notes for {submission.full_name}</DialogTitle>
                                  </DialogHeader>
                                  <Textarea
                                    value={editingNotes?.notes || ''}
                                    onChange={(e) => setEditingNotes(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                    placeholder="Add admin notes here..."
                                    className="min-h-[200px]"
                                  />
                                  <DialogFooter>
                                    <Button onClick={saveAdminNotes} className="mt-4">Save Notes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Contact Form Submissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <Input
                  placeholder="Search contact submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
                <Button onClick={() => downloadCSV('contact')} className="bg-[#d4af36]">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactSubmissions
                    .filter(submission =>
                      submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      submission.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.full_name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link">
                                {submission.message.substring(0, 50)}...
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Full Message</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                {submission.message}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submission_time).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Preview Dialog */}
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

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Delta Phi Epsilon Foundation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
