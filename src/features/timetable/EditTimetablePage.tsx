import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useClassTimetable, useBulkUpsertTimetable } from '../../hooks/useTimetable'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { useTeachers } from '../../hooks/useProfile'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { DAYS, PERIODS } from './TimetableGrid'

interface CellData {
  subject_id: string
  teacher_id: string
}

type TimetableState = Record<string, CellData>

export function EditTimetablePage() {
  const navigate = useNavigate()
  const { classId } = useParams<{ classId: string }>()
  const { profile } = useAuth()
  const { showToast } = useToast()

  const { data: allClasses } = useClasses()
  const { data: subjects } = useSubjects()
  const { data: teachers } = useTeachers()
  const { data: existingTimetable, isLoading } = useClassTimetable(classId)
  const bulkUpsert = useBulkUpsertTimetable()

  const [selectedClassId, setSelectedClassId] = useState(classId || '')
  const [timetableState, setTimetableState] = useState<TimetableState>({})

  const isHeadmaster = profile?.role === 'headmaster'

  // Only headmaster can edit - redirect after hooks
  useEffect(() => {
    if (!isHeadmaster) {
      navigate('/timetable')
    }
  }, [isHeadmaster, navigate])

  // Initialize state from existing timetable
  useEffect(() => {
    if (existingTimetable) {
      const state: TimetableState = {}
      existingTimetable.forEach((entry) => {
        const key = `${entry.day_of_week}-${entry.start_time}`
        state[key] = {
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
        }
      })
      setTimetableState(state)
    }
  }, [existingTimetable])

  // Update URL when class changes
  useEffect(() => {
    if (selectedClassId && selectedClassId !== classId) {
      navigate(`/timetable/${selectedClassId}/edit`, { replace: true })
    }
  }, [selectedClassId, classId, navigate])

  // Show nothing while checking authorization
  if (!isHeadmaster) {
    return null
  }

  const getCellKey = (dayIndex: number, startTime: string) =>
    `${dayIndex}-${startTime}`

  const getCellData = (dayIndex: number, startTime: string): CellData => {
    return timetableState[getCellKey(dayIndex, startTime)] || {
      subject_id: '',
      teacher_id: '',
    }
  }

  const updateCell = (
    dayIndex: number,
    startTime: string,
    field: keyof CellData,
    value: string
  ) => {
    const key = getCellKey(dayIndex, startTime)
    setTimetableState((prev) => ({
      ...prev,
      [key]: {
        ...getCellData(dayIndex, startTime),
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!selectedClassId) {
      showToast('Please select a class', 'error')
      return
    }

    const entries = Object.entries(timetableState)
      .filter(([, data]) => data.subject_id && data.teacher_id)
      .map(([key, data]) => {
        const [dayOfWeek, startTime] = key.split('-')
        const period = PERIODS.find((p) => p.start === startTime)
        return {
          class_id: selectedClassId,
          subject_id: data.subject_id,
          teacher_id: data.teacher_id,
          day_of_week: parseInt(dayOfWeek),
          start_time: startTime,
          end_time: period?.end || startTime,
        }
      })

    try {
      await bulkUpsert.mutateAsync({ classId: selectedClassId, entries })
      showToast('Timetable saved successfully', 'success')
      navigate('/timetable')
    } catch {
      showToast('Failed to save timetable', 'error')
    }
  }

  const classOptions =
    allClasses?.map((c) => ({ value: c.id, label: c.name })) || []

  const subjectOptions = [
    { value: '', label: '-' },
    ...(subjects?.map((s: { id: string; name: string }) => ({ value: s.id, label: s.name })) || []),
  ]

  const teacherOptions = [
    { value: '', label: '-' },
    ...(teachers?.map((t) => ({ value: t.id, label: t.full_name })) || []),
  ]

  const selectedClassName =
    allClasses?.find((c) => c.id === selectedClassId)?.name || ''

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/timetable')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Timetable</h1>
            <p className="text-gray-600 mt-1">
              {selectedClassName
                ? `Configure schedule for ${selectedClassName}`
                : 'Select a class to edit its timetable'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={bulkUpsert.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Timetable
        </Button>
      </div>

      {/* Class selector */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select
            label="Select Class"
            options={classOptions}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          />
        </div>
      </div>

      {/* Editable Timetable Grid */}
      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-96 bg-gray-100 rounded"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-24">
                        Time
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period, periodIndex) => (
                      <tr
                        key={period.period}
                        className={periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="border border-gray-200 p-2 text-xs text-gray-600 whitespace-nowrap">
                          <div className="font-medium">Period {period.period}</div>
                          <div>
                            {formatTime(period.start)} - {formatTime(period.end)}
                          </div>
                        </td>
                        {DAYS.map((_, dayIndex) => {
                          const cellData = getCellData(dayIndex, period.start)
                          return (
                            <td
                              key={dayIndex}
                              className="border border-gray-200 p-2 min-w-[140px]"
                            >
                              <div className="space-y-1">
                                <select
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  value={cellData.subject_id}
                                  onChange={(e) =>
                                    updateCell(dayIndex, period.start, 'subject_id', e.target.value)
                                  }
                                >
                                  {subjectOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  value={cellData.teacher_id}
                                  onChange={(e) =>
                                    updateCell(dayIndex, period.start, 'teacher_id', e.target.value)
                                  }
                                >
                                  {teacherOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
