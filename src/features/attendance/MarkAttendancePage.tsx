import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Clock, Users } from 'lucide-react'
import { useStudentsByClass } from '../../hooks/useStudents'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useMarkAttendance } from '../../hooks/useAttendance'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { Class } from '../../lib/types'

type AttendanceStatus = 'present' | 'absent' | 'late'

interface StudentAttendance {
  studentId: string
  studentName: string
  status: AttendanceStatus
}

export function MarkAttendancePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()

  const isHeadmaster = profile?.role === 'headmaster'

  // Get available classes based on role
  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    !isHeadmaster ? profile?.id : undefined
  )

  const availableClasses = isHeadmaster
    ? allClasses
    : teacherClasses?.map((tc) => tc.classes).filter(Boolean)

  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendance[]>([])

  const { data: students, isLoading: isLoadingStudents } = useStudentsByClass(selectedClass)
  const markAttendance = useMarkAttendance()

  // Initialize attendance records when students load
  useEffect(() => {
    if (students) {
      setAttendanceRecords(
        students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          status: 'present' as AttendanceStatus,
        }))
      )
    }
  }, [students])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    )
  }

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status }))
    )
  }

  const handleSubmit = async () => {
    if (!profile?.id) return

    try {
      const records = attendanceRecords.map((record) => ({
        student_id: record.studentId,
        date: selectedDate,
        status: record.status,
        marked_by: profile.id,
      }))

      await markAttendance.mutateAsync(records)
      showToast('Attendance marked successfully', 'success')
      navigate('/attendance')
    } catch {
      showToast('Failed to mark attendance', 'error')
    }
  }

  const classOptions =
    availableClasses?.map((c: Class) => ({
      value: c.id,
      label: c.name,
    })) || []

  const stats = {
    present: attendanceRecords.filter((r) => r.status === 'present').length,
    absent: attendanceRecords.filter((r) => r.status === 'absent').length,
    late: attendanceRecords.filter((r) => r.status === 'late').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Class"
              placeholder="Choose a class"
              options={classOptions}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      {selectedClass && (
        <>
          {/* Quick Actions & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mark all as:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll('present')}
              >
                <Check className="h-4 w-4 mr-1 text-green-600" />
                Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll('absent')}
              >
                <X className="h-4 w-4 mr-1 text-red-600" />
                Absent
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Badge variant="success">{stats.present}</Badge> Present
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="danger">{stats.absent}</Badge> Absent
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="warning">{stats.late}</Badge> Late
              </span>
            </div>
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">
                  Students ({attendanceRecords.length})
                </h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStudents ? (
                <div className="p-8 text-center text-gray-500">Loading students...</div>
              ) : attendanceRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No students found in this class
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {attendanceRecords.map((record, index) => (
                    <li
                      key={record.studentId}
                      className="flex items-center justify-between px-4 py-3 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-6">
                          {index + 1}.
                        </span>
                        <span className="font-medium text-gray-900">
                          {record.studentName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(record.studentId, 'present')
                          }
                          className={`p-2 rounded-full transition-colors ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                          }`}
                          title="Present"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(record.studentId, 'absent')
                          }
                          className={`p-2 rounded-full transition-colors ${
                            record.status === 'absent'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                          }`}
                          title="Absent"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(record.studentId, 'late')
                          }
                          className={`p-2 rounded-full transition-colors ${
                            record.status === 'late'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
                          }`}
                          title="Late"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          {attendanceRecords.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                isLoading={markAttendance.isPending}
                className="w-full sm:w-auto"
              >
                Save Attendance
              </Button>
            </div>
          )}
        </>
      )}

      {!selectedClass && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a class to mark attendance</p>
        </Card>
      )}
    </div>
  )
}
