import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  BookOpen,
  Megaphone,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStudents } from '../../hooks/useStudents'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

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

export function HeadmasterDashboard() {
  const { profile } = useAuth()
  const { data: students, isLoading: isLoadingStudents } = useStudents()
  const { data: announcements } = useAnnouncements()
  const today = new Date().toISOString().split('T')[0]

  // Get today's attendance summary across all classes
  const { data: todayAttendance } = useQuery({
    queryKey: ['attendance-today-summary', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('date', today)

      if (error) throw error
      return data
    },
  })

  const studentCount = isLoadingStudents ? '...' : (students?.length || 0)
  const totalStudents = students?.length || 0
  const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0
  const attendanceRate = totalStudents > 0 && todayAttendance?.length
    ? `${Math.round((presentToday / todayAttendance.length) * 100)}%`
    : '--%'

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening at GBPS D-1 Area today
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={studentCount}
          icon={Users}
          href="/students"
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Attendance"
          value={attendanceRate}
          icon={Calendar}
          href="/attendance"
          color="bg-green-500"
        />
        <StatCard
          title="Pending Grades"
          value="--"
          icon={BookOpen}
          href="/grades"
          color="bg-yellow-500"
        />
        <StatCard
          title="Announcements"
          value={announcements?.length || 0}
          icon={Megaphone}
          href="/announcements"
          color="bg-purple-500"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/students/new" className="block">
              <Button variant="outline" className="w-full justify-between">
                Add New Student
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/announcements/new" className="block">
              <Button variant="outline" className="w-full justify-between">
                Post Announcement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/reports" className="block">
              <Button variant="outline" className="w-full justify-between">
                Generate Report
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
            <Link to="/announcements">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
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
                        <p className="text-sm text-gray-500 line-clamp-1">{announcement.content}</p>
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
                <p>No announcements yet</p>
                <Link to="/announcements/new" className="text-primary-600 hover:underline text-sm">
                  Create one now
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reports</CardTitle>
          <Link to="/reports">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/reports/attendance">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Attendance Report</p>
                    <p className="text-sm text-gray-500">Monthly attendance summary</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/reports/grades">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Grade Report</p>
                    <p className="text-sm text-gray-500">Student report cards</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
