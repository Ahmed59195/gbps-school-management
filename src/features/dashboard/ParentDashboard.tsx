import { Link } from 'react-router-dom'
import {
  Calendar,
  BookOpen,
  ClipboardList,
  Clock,
  Megaphone,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { AttendanceBadge, Badge } from '../../components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useHomeworkByClass } from '../../hooks/useHomework'
import { useClassTimetable } from '../../hooks/useTimetable'
import { useAnnouncementsForRole } from '../../hooks/useAnnouncements'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
  return (
    <Link to={href}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ParentDashboard() {
  const { profile } = useAuth()

  // Get parent's children
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
    enabled: !!profile?.id,
  })

  const child = children?.[0]
  const today = new Date().toISOString().split('T')[0]

  // Get announcements for parent role
  const { data: announcements } = useAnnouncementsForRole('parent')

  // Get homework for child's class
  const { data: classHomework } = useHomeworkByClass(child?.class_id)

  // Filter to upcoming homework only
  const upcomingHomework = classHomework?.filter(hw => {
    const dueDate = new Date(hw.due_date)
    const todayDate = new Date(today)
    return dueDate >= todayDate
  }) || []

  // Get today's timetable entries
  const { data: timetable } = useClassTimetable(child?.class_id)
  const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to 0 = Monday
  const todaysClasses = timetable?.filter(entry => entry.day_of_week === adjustedDayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time)) || []

  // Get child's grades
  const { data: childGrades } = useQuery({
    queryKey: ['child-grades', child?.id],
    queryFn: async () => {
      if (!child?.id) return []
      const { data, error } = await supabase
        .from('grades')
        .select('*, subject:subjects(name), term:terms(name, is_current)')
        .eq('student_id', child.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data
    },
    enabled: !!child?.id,
  })

  // Get recent attendance for the child (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: recentAttendance } = useQuery({
    queryKey: ['child-attendance', child?.id, sevenDaysAgo],
    queryFn: async () => {
      if (!child?.id) return []
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', child.id)
        .gte('date', sevenDaysAgo)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!child?.id,
  })

  const presentDays = recentAttendance?.filter(a => a.status === 'present').length || 0
  const totalDays = recentAttendance?.length || 0
  const weeklyAttendance = totalDays > 0 ? `${Math.round((presentDays / totalDays) * 100)}%` : '--%'

  // Get latest grade for display
  const latestGrade = childGrades?.[0]
  const latestGradeDisplay = latestGrade
    ? `${latestGrade.grade_letter || Math.round((latestGrade.marks / latestGrade.max_marks) * 100) + '%'}`
    : '--'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Stay updated with your child's progress
        </p>
      </div>

      {/* Child info card */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600 font-medium">Your Child</p>
              <p className="text-xl font-bold text-gray-900">{child?.name || 'No child linked'}</p>
              <p className="text-sm text-gray-600">Class: {child?.class?.name || '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="This Week's Attendance"
          value={weeklyAttendance}
          icon={Calendar}
          href="/attendance"
          color="bg-green-500"
        />
        <StatCard
          title="Latest Grade"
          value={latestGradeDisplay}
          icon={BookOpen}
          href="/grades"
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Homework"
          value={upcomingHomework.length}
          icon={ClipboardList}
          href="/homework"
          color="bg-yellow-500"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Attendance</CardTitle>
            <Link to="/attendance">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAttendance && recentAttendance.length > 0 ? (
              <ul className="space-y-2">
                {recentAttendance.slice(0, 5).map((record: any) => (
                  <li key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
                    <AttendanceBadge status={record.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No attendance records yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming homework */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Homework</CardTitle>
            <Link to="/homework">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingHomework.length > 0 ? (
              <ul className="space-y-2">
                {upcomingHomework.slice(0, 5).map((hw) => {
                  const isDueToday = hw.due_date === today
                  return (
                    <li key={hw.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium text-gray-900">{hw.title}</span>
                        <span className="text-sm text-gray-500 ml-2">({hw.subject?.name})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Due: {new Date(hw.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {isDueToday && <Badge variant="warning">Due Today</Badge>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No upcoming homework</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest grades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Grades</CardTitle>
          <Link to="/grades">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {childGrades && childGrades.length > 0 ? (
            <ul className="space-y-2">
              {childGrades.map((grade: any) => (
                <li key={grade.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-gray-900">{grade.subject?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({grade.term?.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{grade.marks}/{grade.max_marks}</span>
                    {grade.grade_letter && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        grade.grade_letter.startsWith('A') ? 'bg-green-100 text-green-800' :
                        grade.grade_letter === 'B' ? 'bg-blue-100 text-blue-800' :
                        grade.grade_letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.grade_letter}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No grades recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Classes</CardTitle>
          <Link to="/timetable">
            <Button variant="ghost" size="sm">
              Full Timetable
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todaysClasses.length > 0 ? (
            <ul className="space-y-2">
              {todaysClasses.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-gray-900">{entry.subject?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({entry.teacher?.full_name})</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No classes scheduled for today</p>
              <Link to="/timetable" className="text-primary-600 hover:underline text-sm">
                View Full Timetable
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* School announcements */}
      <Card>
        <CardHeader>
          <CardTitle>School Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements && announcements.length > 0 ? (
            <ul className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <li key={announcement.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-2">
                    <Megaphone className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{announcement.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No announcements at this time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
