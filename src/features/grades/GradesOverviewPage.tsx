import { Link } from 'react-router-dom'
import { BookOpen, PenLine, FileText, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useSubjects, useCurrentTerm } from '../../hooks/useGrades'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export function GradesOverviewPage() {
  const { profile } = useAuth()
  const isHeadmaster = profile?.role === 'headmaster'
  const isTeacher = profile?.role === 'teacher'
  const canEnter = isHeadmaster || isTeacher

  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    isTeacher ? profile?.id : undefined
  )
  const { data: subjects } = useSubjects()
  const { data: currentTerm } = useCurrentTerm()

  const classCount = isHeadmaster
    ? allClasses?.length || 0
    : teacherClasses?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-1">
            {canEnter ? 'Enter and manage student grades' : 'View student grades'}
          </p>
        </div>
        {canEnter && (
          <Link to="/grades/enter">
            <Button>
              <PenLine className="h-4 w-4 mr-2" />
              Enter Grades
            </Button>
          </Link>
        )}
      </div>

      {/* Current Term Info */}
      {currentTerm && (
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium">Current Term</p>
                <p className="text-lg font-semibold text-primary-900">
                  {currentTerm.name}
                </p>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canEnter && (
          <Link to="/grades/enter">
            <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <PenLine className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enter Grades</h3>
                    <p className="text-sm text-gray-500">
                      Record student grades
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {isHeadmaster && (
          <Link to="/reports/grades">
            <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Grade Reports</h3>
                    <p className="text-sm text-gray-500">
                      Generate PDF reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Card className="h-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Subjects</h2>
            </div>
          </CardHeader>
          <CardContent>
            {subjects && subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject.id} variant="secondary">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No subjects found</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Stats</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{classCount}</p>
                <p className="text-sm text-gray-500">
                  {isHeadmaster ? 'Classes' : 'Your Classes'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {subjects?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grading Scale */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Grading Scale</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { grade: 'A+', range: '90-100%', color: 'success' },
              { grade: 'A', range: '80-89%', color: 'success' },
              { grade: 'B', range: '70-79%', color: 'info' },
              { grade: 'C', range: '60-69%', color: 'warning' },
              { grade: 'D', range: '50-59%', color: 'warning' },
              { grade: 'F', range: '0-49%', color: 'danger' },
            ].map((item) => (
              <div
                key={item.grade}
                className="text-center p-3 bg-gray-50 rounded-lg"
              >
                <Badge variant={item.color as any} className="mb-2">
                  {item.grade}
                </Badge>
                <p className="text-xs text-gray-500">{item.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
