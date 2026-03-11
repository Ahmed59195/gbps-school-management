import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableLoading,
  TableEmpty,
} from '../../components/ui/Table'
import { AttendanceBadge } from '../../components/ui/Badge'
import type { Class, Attendance } from '../../lib/types'

interface AttendanceRecord extends Attendance {
  student: { id: string; name: string; class_id: string }
}

export function AttendanceHistoryPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isHeadmaster = profile?.role === 'headmaster'

  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    !isHeadmaster ? profile?.id : undefined
  )

  const availableClasses = isHeadmaster
    ? allClasses
    : teacherClasses?.map((tc) => tc.classes).filter(Boolean)

  const initialDates = useRef(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    }
  })
  const dates = useMemo(() => initialDates.current(), [])

  const [selectedClass, setSelectedClass] = useState('')
  const [startDate, setStartDate] = useState(dates.start)
  const [endDate, setEndDate] = useState(dates.end)

  // Fetch attendance history
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance-history', selectedClass, startDate, endDate],
    queryFn: async () => {
      if (!selectedClass) return []

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students!inner(id, name, class_id)
        `)
        .eq('student.class_id', selectedClass)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!selectedClass,
  })

  // Group attendance by date
  const groupedAttendance: Record<string, AttendanceRecord[]> | undefined = attendanceData?.reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
    const typedRecord = record as AttendanceRecord
    const date = typedRecord.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(typedRecord)
    return acc
  }, {})

  const classOptions =
    availableClasses?.map((c: Class) => ({
      value: c.id,
      label: c.name,
    })) || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Class"
              placeholder="Select a class"
              options={classOptions}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            />
            <Input
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedClass ? (
        groupedAttendance && Object.keys(groupedAttendance).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedAttendance).map(([date, records]) => {
              const stats = {
                present: records.filter((r) => r.status === 'present').length,
                absent: records.filter((r) => r.status === 'absent').length,
                late: records.filter((r) => r.status === 'late').length,
              }

              return (
                <Card key={date}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatDate(date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-600">{stats.present} Present</span>
                        <span className="text-red-600">{stats.absent} Absent</span>
                        <span className="text-yellow-600">{stats.late} Late</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.student.name}</TableCell>
                            <TableCell className="text-right">
                              <AttendanceBadge status={record.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : isLoading ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableLoading columns={3} rows={5} />
            </Table>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableEmpty
                columns={3}
                message="No attendance records found for the selected criteria"
              />
            </Table>
          </Card>
        )
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a class to view attendance history</p>
        </Card>
      )}
    </div>
  )
}
