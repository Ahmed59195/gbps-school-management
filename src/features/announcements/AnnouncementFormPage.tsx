import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncements'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  target_role: z.enum(['all', 'teacher', 'parent']),
})

type AnnouncementFormData = z.infer<typeof announcementSchema>

export function AnnouncementFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { profile } = useAuth()
  const { showToast } = useToast()

  const { data: announcement, isLoading } = useAnnouncement(id)
  const createAnnouncement = useCreateAnnouncement()
  const updateAnnouncement = useUpdateAnnouncement()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      target_role: 'all',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        content: announcement.content,
        target_role: announcement.target_role as 'all' | 'teacher' | 'parent',
      })
    }
  }, [announcement, reset])

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!profile?.id) return

    try {
      if (isEditing && id) {
        await updateAnnouncement.mutateAsync({
          id,
          ...data,
        })
        showToast('Announcement updated successfully', 'success')
      } else {
        await createAnnouncement.mutateAsync({
          ...data,
          created_by: profile.id,
        })
        showToast('Announcement created successfully', 'success')
      }
      navigate('/announcements')
    } catch (err) {
      showToast(
        isEditing ? 'Failed to update announcement' : 'Failed to create announcement',
        'error'
      )
    }
  }

  const targetOptions = [
    { value: 'all', label: 'Everyone' },
    { value: 'teacher', label: 'Teachers Only' },
    { value: 'parent', label: 'Parents Only' },
  ]

  if (isEditing && isLoading) {
    return <SkeletonCard />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Announcement' : 'New Announcement'}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Announcement Details</h2>
          <p className="text-sm text-gray-600">
            {isEditing
              ? 'Update the announcement'
              : 'Create a new announcement for the school'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="Enter announcement title"
              error={errors.title?.message}
              {...register('title')}
            />

            <Select
              label="Target Audience"
              options={targetOptions}
              error={errors.target_role?.message}
              {...register('target_role')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                className={`block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 min-h-[150px] ${
                  errors.content
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                placeholder="Enter announcement content..."
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/announcements')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Update Announcement' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
