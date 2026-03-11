import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Calendar, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useClasses } from '../../hooks/useClasses'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { AttendanceReportPDF } from './AttendanceReportPDF'

export function AttendanceReportPage() {
  const navigate = useNavigate()
  const { data: classes, isLoading: classesLoading } = useClasses()

  const [classId, setClassId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!classId || !startDate || !endDate) {
      alert('Please fill in all fields')
      return
    }

    try {
      setIsGenerating(true)

      // Fetch attendance records for the class and date range
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name')
        .eq('class_id', classId)
        .order('name')

      if (studentsError) throw studentsError

      const studentIds = students?.map((s) => s.id) || []

      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('*, student:students(name)')
        .in('student_id', studentIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (attendanceError) throw attendanceError

      // Get class name
      const selectedClass = classes?.find((c) => c.id === classId)

      // Calculate statistics
      const totalRecords = attendanceRecords?.length || 0
      const totalPresent = attendanceRecords?.filter((r) => r.status === 'present').length || 0
      const totalAbsent = attendanceRecords?.filter((r) => r.status === 'absent').length || 0
      const totalLate = attendanceRecords?.filter((r) => r.status === 'late').length || 0
      const presentRate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : '0'

      // Prepare report data
      const reportData = {
        className: selectedClass?.name || 'Unknown Class',
        startDate,
        endDate,
        records:
          attendanceRecords?.map((record) => ({
            student_name: record.student?.name || 'Unknown',
            date: record.date,
            status: record.status,
          })) || [],
        stats: {
          totalDays: totalRecords,
          totalPresent,
          totalAbsent,
          totalLate,
          presentRate,
        },
      }

      // Generate PDF
      const pdfDoc = <AttendanceReportPDF data={reportData} />
      const blob = await pdf(pdfDoc).toBlob()

      // Download PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance-report-${selectedClass?.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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
          <Calendar className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
        </div>
        <p className="text-gray-600">Generate a detailed attendance report for a specific class and date range</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h2>

        <div className="space-y-4">
          {/* Class Selection */}
          <div>
            <Select
              id="class"
              label="Select Class *"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={classesLoading}
              placeholder="-- Select a class --"
              options={
                classes?.map((cls) => ({
                  value: cls.id,
                  label: cls.name,
                })) || []
              }
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleGenerateReport}
            disabled={!classId || !startDate || !endDate || isGenerating}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate & Download Report'}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The report will include all attendance records for the selected class
          within the specified date range. The PDF will automatically download to your device.
        </p>
      </div>
    </div>
  )
}
