import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useStudent, useCreateStudent, useUpdateStudent } from '../../hooks/useStudents'
import { useClasses } from '../../hooks/useClasses'
import { useParents } from '../../hooks/useProfile'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  class_id: z.string().min(1, 'Please select a class'),
  parent_id: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female']).optional().nullable(),
  address: z.string().optional().nullable(),
})

type StudentFormData = z.infer<typeof studentSchema>

export function StudentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)

  const { showToast } = useToast()
  const { data: student, isLoading: isLoadingStudent } = useStudent(id)
  const { data: classes, isLoading: isLoadingClasses } = useClasses()
  const { data: parents, isLoading: isLoadingParents } = useParents()
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      class_id: '',
      parent_id: '',
      date_of_birth: '',
      gender: null,
      address: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        class_id: student.class_id,
        parent_id: student.parent_id || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender,
        address: student.address || '',
      })
    }
  }, [student, reset])

  const onSubmit = async (data: StudentFormData) => {
    try {
      const payload = {
        ...data,
        parent_id: data.parent_id || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        address: data.address || null,
      }

      if (isEditing && id) {
        await updateStudent.mutateAsync({ id, ...payload })
        showToast('Student updated successfully', 'success')
      } else {
        await createStudent.mutateAsync(payload)
        showToast('Student created successfully', 'success')
      }
      navigate('/students')
    } catch (err) {
      showToast(
        isEditing ? 'Failed to update student' : 'Failed to create student',
        'error'
      )
    }
  }

  const classOptions = classes?.map((c) => ({ value: c.id, label: c.name })) || []

  const parentOptions = [
    { value: '', label: 'No parent assigned' },
    ...(parents?.map((p) => ({ value: p.id, label: `${p.full_name} (${p.email})` })) || []),
  ]

  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ]

  if (isEditing && isLoadingStudent) {
    return <SkeletonCard />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Student' : 'Add New Student'}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Student Information</h2>
          <p className="text-sm text-gray-600">
            {isEditing
              ? 'Update the student details below'
              : 'Fill in the details to add a new student'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              placeholder="Enter student's full name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Select
              label="Class"
              placeholder="Select a class"
              options={classOptions}
              error={errors.class_id?.message}
              disabled={isLoadingClasses}
              {...register('class_id')}
            />

            <Select
              label="Parent/Guardian"
              placeholder="Select a parent"
              options={parentOptions}
              error={errors.parent_id?.message}
              disabled={isLoadingParents}
              {...register('parent_id')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />

              <Select
                label="Gender"
                options={genderOptions}
                error={errors.gender?.message}
                {...register('gender')}
              />
            </div>

            <Input
              label="Address"
              placeholder="Enter student's address (optional)"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/students')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
