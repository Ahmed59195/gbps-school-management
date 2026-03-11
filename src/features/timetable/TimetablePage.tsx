import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useAuth } from '../../context/AuthContext'
import { Select } from '../../components/ui/Select'
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TimetableGrid } from './TimetableGrid'
import type { TimetableEntryWithDetails } from '../../lib/types'

export function TimetablePage() {
  const { profile } = useAuth()
  const isHeadmaster = profile?.role === 'headmaster'
  const isTeacher = profile?.role === 'teacher'
  const isParent = profile?.role === 'parent'

  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    isTeacher ? profile?.id : undefined
  )

  // Get parent's child class
  const { data: children } = useQuery({
    queryKey: ['parent-children', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(id, name)')
        .eq('parent_id', profile.id)
      if (error) throw error
      return data
    },
    enabled: isParent && !!profile?.id,
  })

  const availableClasses = isHeadmaster
    ? allClasses
    : isTeacher
    ? teacherClasses?.map((tc) => tc.classes).filter(Boolean)
    : children?.map((c) => c.class).filter(Boolean)

  const [selectedClass, setSelectedClass] = useState('')

  // Auto-select class based on role
  useEffect(() => {
    if (!selectedClass && availableClasses && availableClasses.length > 0) {
      setSelectedClass((availableClasses[0] as any)?.id || '')
    }
  }, [availableClasses, selectedClass])

  // Fetch timetable entries
  const { data: timetableEntries, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return []

      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          subject:subjects(id, name),
          teacher:profiles(id, full_name)
        `)
        .eq('class_id', selectedClass)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error
      return data as TimetableEntryWithDetails[]
    },
    enabled: !!selectedClass,
  })

  const classOptions =
    availableClasses?.map((c: any) => ({
      value: c.id,
      label: c.name,
    })) || []

  const selectedClassName =
    availableClasses?.find((c: any) => c.id === selectedClass)?.name || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600 mt-1">
            {isHeadmaster
              ? 'View and manage class timetables'
              : `Weekly schedule${selectedClassName ? ` for ${selectedClassName}` : ''}`}
          </p>
        </div>
        {isHeadmaster && selectedClass && (
          <Link to={`/timetable/${selectedClass}/edit`}>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Edit Timetable
            </Button>
          </Link>
        )}
      </div>

      {/* Class Selector */}
      {(isHeadmaster || (availableClasses && availableClasses.length > 1)) && (
        <Card>
          <CardContent className="py-4">
            <div className="max-w-xs">
              <Select
                label="Select Class"
                placeholder="Choose a class"
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      {selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedClassName ? `${selectedClassName} Weekly Schedule` : 'Weekly Schedule'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            ) : timetableEntries && timetableEntries.length > 0 ? (
              <TimetableGrid entries={timetableEntries} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No timetable configured for this class</p>
                {isHeadmaster && selectedClass && (
                  <Link to={`/timetable/${selectedClass}/edit`}>
                    <Button variant="outline" className="mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Set Up Timetable
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a class to view the timetable</p>
        </Card>
      )}
    </div>
  )
}
