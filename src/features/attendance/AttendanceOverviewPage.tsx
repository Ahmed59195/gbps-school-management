import { Link } from 'react-router-dom'
import { ClipboardCheck, History, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'

export function AttendanceOverviewPage() {
  const { profile } = useAuth()
  const isHeadmaster = profile?.role === 'headmaster'
  const isTeacher = profile?.role === 'teacher'
  const canMark = isHeadmaster || isTeacher

  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    isTeacher ? profile?.id : undefined
  )

  const classCount = isHeadmaster
    ? allClasses?.length || 0
    : teacherClasses?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            {canMark
              ? 'Mark and track student attendance'
              : 'View attendance records'}
          </p>
        </div>
        {canMark && (
          <Link to="/attendance/mark">
            <Button>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canMark && (
          <Link to="/attendance/mark">
            <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
                    <p className="text-sm text-gray-500">
                      Record today's attendance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link to="/attendance/history">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View History</h3>
                  <p className="text-sm text-gray-500">
                    Browse past attendance records
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {isHeadmaster && (
          <Link to="/reports/attendance">
            <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reports</h3>
                    <p className="text-sm text-gray-500">
                      Generate attendance reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Overview</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{classCount}</p>
              <p className="text-sm text-gray-500">
                {isHeadmaster ? 'Total Classes' : 'Your Classes'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">P</span>
              </div>
              <p className="text-2xl font-bold text-green-600">--</p>
              <p className="text-sm text-gray-500">Present Today</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 font-bold">A</span>
              </div>
              <p className="text-2xl font-bold text-red-600">--</p>
              <p className="text-sm text-gray-500">Absent Today</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 font-bold">L</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">--</p>
              <p className="text-sm text-gray-500">Late Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Attendance activity will appear here once records are added.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
