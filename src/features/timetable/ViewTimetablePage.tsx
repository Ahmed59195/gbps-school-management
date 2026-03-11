import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useClassTimetable } from '../../hooks/useTimetable'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { TimetableGrid } from './TimetableGrid'

export function ViewTimetablePage() {
  const { profile } = useAuth()
  const isHeadmaster = profile?.role === 'headmaster'
  const isTeacher = profile?.role === 'teacher'
  const isParent = profile?.role === 'parent'

  const [selectedClassId, setSelectedClassId] = useState<string>('')

  // Get all classes (for headmaster to select)
  const { data: allClasses } = useClasses()

  // Get teacher's classes (for auto-select)
  const { data: teacherClasses } = useTeacherClasses(isTeacher ? profile?.id : undefined)

  // Get parent's child (for auto-select)
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

  // Auto-select class based on role
  useEffect(() => {
    if (isTeacher && teacherClasses?.[0]?.class_id) {
      setSelectedClassId(teacherClasses[0].class_id)
    } else if (isParent && children?.[0]?.class_id) {
      setSelectedClassId(children[0].class_id)
    } else if (isHeadmaster && allClasses?.[0]?.id) {
      setSelectedClassId(allClasses[0].id)
    }
  }, [isTeacher, isParent, isHeadmaster, teacherClasses, children, allClasses])

  // Get timetable for selected class
  const { data: timetable, isLoading } = useClassTimetable(selectedClassId)

  const classOptions =
    allClasses?.map((c) => ({ value: c.id, label: c.name })) || []

  const selectedClassName =
    allClasses?.find((c) => c.id === selectedClassId)?.name ||
    children?.[0]?.class?.name ||
    ''

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
        {isHeadmaster && selectedClassId && (
          <Link to={`/timetable/${selectedClassId}/edit`}>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Edit Timetable
            </Button>
          </Link>
        )}
      </div>

      {/* Class selector (headmaster only) */}
      {isHeadmaster && (
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
      )}

      {/* Timetable Grid */}
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
          ) : timetable && timetable.length > 0 ? (
            <TimetableGrid entries={timetable} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No timetable configured for this class</p>
              {isHeadmaster && selectedClassId && (
                <Link to={`/timetable/${selectedClassId}/edit`}>
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
    </div>
  )
}
