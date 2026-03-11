import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { GraduationCap, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useStudents } from '../../hooks/useStudents'
import { useTerms } from '../../hooks/useGrades'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { GradeReportPDF } from './GradeReportPDF'

export function GradeReportPage() {
  const navigate = useNavigate()
  const { data: students, isLoading: studentsLoading } = useStudents()
  const { data: terms, isLoading: termsLoading } = useTerms()

  const [studentId, setStudentId] = useState('')
  const [termId, setTermId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!studentId || !termId) {
      alert('Please select both student and term')
      return
    }

    try {
      setIsGenerating(true)

      // Fetch student details
      const selectedStudent = students?.find((s) => s.id === studentId)
      if (!selectedStudent) throw new Error('Student not found')

      // Fetch term details
      const selectedTerm = terms?.find((t) => t.id === termId)
      if (!selectedTerm) throw new Error('Term not found')

      // Fetch grades for the student in the selected term
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(name)
        `)
        .eq('student_id', studentId)
        .eq('term_id', termId)
        .order('subject_id')

      if (gradesError) throw gradesError

      if (!grades || grades.length === 0) {
        alert('No grades found for the selected student and term')
        setIsGenerating(false)
        return
      }

      // Prepare grade data
      const gradeData = grades.map((g) => ({
        subject_name: g.subject?.name || 'Unknown Subject',
        marks: g.marks,
        max_marks: g.max_marks,
        grade_letter: g.grade_letter || 'N/A',
        percentage: (g.marks / g.max_marks) * 100,
      }))

      // Calculate summary
      const totalSubjects = gradeData.length
      const averagePercentage =
        gradeData.reduce((sum, g) => sum + g.percentage, 0) / totalSubjects

      // Determine overall grade
      const overallGrade = calculateGradeLetter(averagePercentage)

      // Prepare report data
      const reportData = {
        studentName: selectedStudent.name,
        className: selectedStudent.class?.name || 'Unknown Class',
        termName: selectedTerm.name,
        termDates: {
          start: selectedTerm.start_date,
          end: selectedTerm.end_date,
        },
        grades: gradeData,
        summary: {
          totalSubjects,
          averagePercentage,
          overallGrade,
        },
      }

      // Generate PDF
      const pdfDoc = <GradeReportPDF data={reportData} />
      const blob = await pdf(pdfDoc).toBlob()

      // Download PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `grade-report-${selectedStudent.name.replace(/\s+/g, '-')}-${selectedTerm.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to calculate grade letter from percentage
  function calculateGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports
        </button>
        <div className="flex items-center mb-2">
          <GraduationCap className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Grade Report</h1>
        </div>
        <p className="text-gray-600">Generate a comprehensive grade report for a student in a specific term</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h2>

        <div className="space-y-4">
          {/* Student Selection */}
          <div>
            <Select
              id="student"
              label="Select Student *"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={studentsLoading}
              placeholder="-- Select a student --"
              options={
                students?.map((student) => ({
                  value: student.id,
                  label: `${student.name} (${student.class?.name})`,
                })) || []
              }
            />
          </div>

          {/* Term Selection */}
          <div>
            <Select
              id="term"
              label="Select Term *"
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              disabled={termsLoading}
              placeholder="-- Select a term --"
              options={
                terms?.map((term) => ({
                  value: term.id,
                  label: `${term.name}${term.is_current ? ' (Current)' : ''}`,
                })) || []
              }
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleGenerateReport}
            disabled={!studentId || !termId || isGenerating}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate & Download Report'}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Note:</strong> The report will include all subject grades for the selected student in
          the chosen term, along with overall performance statistics. The PDF will automatically download
          to your device.
        </p>
      </div>
    </div>
  )
}
