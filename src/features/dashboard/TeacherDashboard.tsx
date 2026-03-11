import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowRight,
  Megaphone,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../hooks/useClasses'
import { useStudentsByClass } from '../../hooks/useStudents'
import { useAttendanceByDate } from '../../hooks/useAttendance'
import { useHomeworkByClass } from '../../hooks/useHomework'
import { useClassTimetable } from '../../hooks/useTimetable'
import { useAnnouncementsForRole } from '../../hooks/useAnnouncements'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

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

export function TeacherDashboard() {
  const { profile } = useAuth()
  const today = new Date().toISOString().split('T')[0]

  // Get teacher's classes
  const { data: teacherClasses } = useTeacherClasses(profile?.id)
  const primaryClass = teacherClasses?.[0]?.classes

  // Get students and attendance for primary class
  const { data: students } = useStudentsByClass(primaryClass?.id)
  const { data: todayAttendance } = useAttendanceByDate(primaryClass?.id, today)
  const { data: classHomework } = useHomeworkByClass(primaryClass?.id)

  // Get today's timetable entries
  const { data: timetable } = useClassTimetable(primaryClass?.id)
  const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to 0 = Monday
  const todaysClasses = timetable?.filter(entry => entry.day_of_week === adjustedDayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time)) || []

  // Calculate pending homework (due today or in future)
  const pendingHomework = classHomework?.filter(hw => {
    const dueDate = new Date(hw.due_date)
    const todayDate = new Date(today)
    return dueDate >= todayDate
  }) || []

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get announcements for teacher role
  const { data: announcements } = useAnnouncementsForRole('teacher')

  const studentCount = students?.length || 0
  const attendanceMarked = todayAttendance && todayAttendance.length > 0
  const presentCount = todayAttendance?.filter(a => a.status === 'present').length || 0
  const attendanceStatus = attendanceMarked
    ? `${presentCount}/${studentCount}`
    : 'Not Marked'

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {profile?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your class overview for today
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Class Students"
          value={studentCount}
          icon={Users}
          href="/attendance"
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Attendance"
          value={attendanceStatus}
          icon={Calendar}
          href="/attendance/mark"
          color={attendanceMarked ? 'bg-green-500' : 'bg-yellow-500'}
        />
        <StatCard
          title="Pending Homework"
          value={pendingHomework.length}
          icon={ClipboardList}
          href="/homework"
          color="bg-purple-500"
        />
        <StatCard
          title="Grades to Enter"
          value="--"
          icon={BookOpen}
          href="/grades/enter"
          color="bg-green-500"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/attendance/mark" className="block">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Mark Attendance</span>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            </Link>
            <Link to="/homework/new" className="block">
              <Button variant="outline" className="w-full justify-between">
                Assign Homework
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/grades/enter" className="block">
              <Button variant="outline" className="w-full justify-between">
                Enter Grades
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

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
                {todaysClasses.slice(0, 5).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium text-gray-900">{entry.subject?.name}</span>
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
      </div>

      {/* Recent homework */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Homework</CardTitle>
          <Link to="/homework">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {classHomework && classHomework.length > 0 ? (
            <ul className="space-y-2">
              {classHomework.slice(0, 5).map((hw) => {
                const dueDate = new Date(hw.due_date)
                const todayDate = new Date(today)
                const isOverdue = dueDate < todayDate
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
                      {isOverdue && <Badge variant="danger">Overdue</Badge>}
                      {isDueToday && <Badge variant="warning">Due Today</Badge>}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No homework assigned yet</p>
              <Link to="/homework/new" className="text-primary-600 hover:underline text-sm">
                Assign homework
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
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
