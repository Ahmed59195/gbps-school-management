import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useHomework, useCreateHomework, useUpdateHomework } from '../../hooks/useHomework'
import { useClasses, useTeacherClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useGrades'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import type { Class } from '../../lib/types'

const homeworkSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  class_id: z.string().min(1, 'Please select a class'),
  subject_id: z.string().min(1, 'Please select a subject'),
  due_date: z.string().min(1, 'Please select a due date'),
  description: z.string().optional(),
})

type HomeworkFormData = z.infer<typeof homeworkSchema>

export function HomeworkFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { profile } = useAuth()
  const { showToast } = useToast()

  const isHeadmaster = profile?.role === 'headmaster'

  const { data: homework, isLoading: isLoadingHomework } = useHomework(id)
  const { data: allClasses } = useClasses()
  const { data: teacherClasses } = useTeacherClasses(
    !isHeadmaster ? profile?.id : undefined
  )
  const { data: subjects } = useSubjects()
  const createHomework = useCreateHomework()
  const updateHomework = useUpdateHomework()

  const availableClasses = isHeadmaster
    ? allClasses
    : teacherClasses?.map((tc) => tc.classes).filter(Boolean)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: '',
      class_id: '',
      subject_id: '',
      due_date: '',
      description: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (homework) {
      reset({
        title: homework.title,
        class_id: homework.class_id,
        subject_id: homework.subject_id,
        due_date: homework.due_date,
        description: homework.description || '',
      })
    }
  }, [homework, reset])

  const onSubmit = async (data: HomeworkFormData) => {
    if (!profile?.id) return

    try {
      if (isEditing && id) {
        await updateHomework.mutateAsync({
          id,
          title: data.title,
          description: data.description || null,
          due_date: data.due_date,
        })
        showToast('Homework updated successfully', 'success')
      } else {
        await createHomework.mutateAsync({
          ...data,
          description: data.description || null,
          assigned_by: profile.id,
        })
        showToast('Homework created successfully', 'success')
      }
      navigate('/homework')
    } catch {
      showToast(
        isEditing ? 'Failed to update homework' : 'Failed to create homework',
        'error'
      )
    }
  }

  const classOptions =
    availableClasses?.map((c: Class) => ({
      value: c.id,
      label: c.name,
    })) || []

  const subjectOptions =
    subjects?.map((s) => ({
      value: s.id,
      label: s.name,
    })) || []

  if (isEditing && isLoadingHomework) {
    return <SkeletonCard />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Homework' : 'New Homework'}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Homework Details</h2>
          <p className="text-sm text-gray-600">
            {isEditing
              ? 'Update the homework assignment'
              : 'Create a new homework assignment'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="Enter homework title"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Class"
                placeholder="Select a class"
                options={classOptions}
                error={errors.class_id?.message}
                disabled={isEditing}
                {...register('class_id')}
              />

              <Select
                label="Subject"
                placeholder="Select a subject"
                options={subjectOptions}
                error={errors.subject_id?.message}
                disabled={isEditing}
                {...register('subject_id')}
              />
            </div>

            <Input
              label="Due Date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              error={errors.due_date?.message}
              {...register('due_date')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                placeholder="Enter homework description or instructions..."
                {...register('description')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/homework')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Update Homework' : 'Create Homework'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
