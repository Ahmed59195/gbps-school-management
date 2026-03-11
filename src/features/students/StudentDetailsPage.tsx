import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, User, Calendar, MapPin, Phone, Mail, Users } from 'lucide-react'
import { useStudent } from '../../hooks/useStudents'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'

export function StudentDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: student, isLoading, error } = useStudent(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonCard />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          {error ? `Error: ${error.message}` : 'Student not found'}
        </p>
        <Button variant="outline" onClick={() => navigate('/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateAge = (dateString: string | null) => {
    if (!dateString) return null
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(student.date_of_birth)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        </div>
        <Button onClick={() => navigate(`/students/${id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{student.class?.name || 'No Class'}</Badge>
                {student.gender && (
                  <Badge variant="outline" className="capitalize">
                    {student.gender}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-gray-900">
                  {formatDate(student.date_of_birth)}
                  {age !== null && <span className="text-gray-500 ml-1">({age} years old)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                <p className="text-gray-900">{formatDate(student.enrollment_date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{student.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian</h3>
          </div>
        </CardHeader>
        <CardContent>
          {student.parent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.parent.full_name}</p>
                  <Badge variant="outline" size="sm">Parent</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {student.parent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${student.parent.email}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {student.parent.email}
                    </a>
                  </div>
                )}
                {student.parent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${student.parent.phone}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {student.parent.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No parent/guardian assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-400">Coming soon</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Average Grade</p>
          <p className="text-xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-400">Coming soon</p>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-500">Pending Homework</p>
          <p className="text-xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-400">Coming soon</p>
        </Card>
      </div>
    </div>
  )
}
