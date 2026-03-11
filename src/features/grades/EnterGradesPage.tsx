import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, BookOpen } from 'lucide-react'
import { useStudentsByClass } from '../../hooks/useStudents'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useSubjects, useTerms, useCurrentTerm, useGradesByClass, useUpsertGrades } from '../../hooks/useGrades'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import type { Class } from '../../lib/types'

interface StudentGrade {
  studentId: string
  studentName: string
  marks: string
  maxMarks: number
}

export function EnterGradesPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()

  const isHeadmaster = profile?.role === 'headmaster'

  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    !isHeadmaster ? profile?.id : undefined
  )
  const { data: subjects } = useSubjects()
  const { data: terms } = useTerms()
  const { data: currentTerm } = useCurrentTerm()

  const availableClasses = isHeadmaster
    ? allClasses
    : teacherClasses?.map((tc) => tc.classes).filter(Boolean)

  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [gradeRecords, setGradeRecords] = useState<StudentGrade[]>([])

  const { data: students } = useStudentsByClass(selectedClass)
  const { data: existingGrades } = useGradesByClass(selectedClass, selectedSubject, selectedTerm)
  const upsertGrades = useUpsertGrades()

  // Set current term as default
  useEffect(() => {
    if (currentTerm && !selectedTerm) {
      setSelectedTerm(currentTerm.id)
    }
  }, [currentTerm, selectedTerm])

  // Initialize grade records when students or existing grades load
  useEffect(() => {
    if (students) {
      const existingGradeMap = new Map(
        existingGrades?.map((g) => [g.student_id, g]) || []
      )

      setGradeRecords(
        students.map((s) => {
          const existing = existingGradeMap.get(s.id)
          return {
            studentId: s.id,
            studentName: s.name,
            marks: existing ? String(existing.marks) : '',
            maxMarks: existing?.max_marks || maxMarks,
          }
        })
      )
    }
  }, [students, existingGrades, maxMarks])

  const handleMarksChange = (studentId: string, marks: string) => {
    // Allow empty or valid numbers only
    if (marks === '' || (!isNaN(Number(marks)) && Number(marks) >= 0)) {
      setGradeRecords((prev) =>
        prev.map((record) =>
          record.studentId === studentId ? { ...record, marks } : record
        )
      )
    }
  }

  const handleSubmit = async () => {
    if (!profile?.id) return

    // Validate grades
    const invalidGrades = gradeRecords.filter(
      (r) => r.marks !== '' && (Number(r.marks) < 0 || Number(r.marks) > maxMarks)
    )

    if (invalidGrades.length > 0) {
      showToast(`Invalid marks for ${invalidGrades[0].studentName}. Must be between 0 and ${maxMarks}`, 'error')
      return
    }

    // Filter only records with marks entered
    const gradesToSave = gradeRecords
      .filter((r) => r.marks !== '')
      .map((r) => ({
        student_id: r.studentId,
        subject_id: selectedSubject,
        term_id: selectedTerm,
        marks: Number(r.marks),
        max_marks: maxMarks,
        entered_by: profile.id,
      }))

    if (gradesToSave.length === 0) {
      showToast('Please enter marks for at least one student', 'error')
      return
    }

    try {
      await upsertGrades.mutateAsync(gradesToSave)
      showToast('Grades saved successfully', 'success')
      navigate('/grades')
    } catch {
      showToast('Failed to save grades', 'error')
    }
  }

  const classOptions =
    availableClasses?.map((c: Class) => ({
      value: c.id,
      label: c.name,
    })) || []

  const subjectOptions =
    subjects?.map((s) => ({
      value: s.id,
      label: s.name,
    })) || []

  const termOptions =
    terms?.map((t) => ({
      value: t.id,
      label: `${t.name}${t.is_current ? ' (Current)' : ''}`,
    })) || []

  const calculateGradeLetter = (marks: number): string => {
    const percentage = (marks / maxMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  const getGradeColor = (grade: string): BadgeVariant => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success'
      case 'B':
        return 'info'
      case 'C':
        return 'warning'
      case 'D':
      case 'F':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const filledCount = gradeRecords.filter((r) => r.marks !== '').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/grades')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Enter Grades</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Class"
              placeholder="Select class"
              options={classOptions}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            />
            <Select
              label="Subject"
              placeholder="Select subject"
              options={subjectOptions}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            />
            <Select
              label="Term"
              placeholder="Select term"
              options={termOptions}
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            />
            <Input
              label="Max Marks"
              type="number"
              min={1}
              max={1000}
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Entry */}
      {selectedClass && selectedSubject && selectedTerm ? (
        <>
          {/* Stats */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filledCount} of {gradeRecords.length} students graded
            </p>
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">
                  Students ({gradeRecords.length})
                </h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {gradeRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No students found in this class
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {gradeRecords.map((record, index) => {
                    const hasMarks = record.marks !== ''
                    const marks = Number(record.marks)
                    const gradeLetter = hasMarks ? calculateGradeLetter(marks) : null

                    return (
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
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={record.marks}
                              onChange={(e) =>
                                handleMarksChange(record.studentId, e.target.value)
                              }
                              className="w-20 text-center"
                              placeholder="--"
                            />
                            <span className="text-gray-500">/ {maxMarks}</span>
                          </div>
                          {gradeLetter && (
                            <Badge variant={getGradeColor(gradeLetter)}>
                              {gradeLetter}
                            </Badge>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          {gradeRecords.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                isLoading={upsertGrades.isPending}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Grades
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Select a class, subject, and term to enter grades
          </p>
        </Card>
      )}
    </div>
  )
}
