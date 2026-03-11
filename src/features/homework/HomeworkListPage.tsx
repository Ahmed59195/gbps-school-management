import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Calendar, BookOpen, Trash2, Pencil } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAllHomework, useHomeworkByClass, useDeleteHomework } from '../../hooks/useHomework'
import { useClasses } from '../../hooks/useClasses'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal, ModalFooter } from '../../components/ui/Modal'

export function HomeworkListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()
  const isHeadmaster = profile?.role === 'headmaster'
  const isTeacher = profile?.role === 'teacher'
  const isParent = profile?.role === 'parent'
  const canCreate = isHeadmaster || isTeacher

  // For parents, get their child's class
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
  const childClassId = children?.[0]?.class_id

  // Use different hooks based on role
  const { data: allHomework, isLoading: isLoadingAll } = useAllHomework()
  const { data: classHomework, isLoading: isLoadingClass } = useHomeworkByClass(isParent ? childClassId : undefined)

  // Parents see only their child's class homework, others see all
  const homework = isParent ? classHomework : allHomework
  const isLoading = isParent ? isLoadingClass : isLoadingAll

  const { data: classes } = useClasses()
  const deleteHomework = useDeleteHomework()

  const [filterClass, setFilterClass] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  })

  const filteredHomework = homework?.filter((h) => !filterClass || h.class_id === filterClass)

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...(classes?.map((c) => ({ value: c.id, label: c.name })) || []),
  ]

  const handleDelete = async () => {
    try {
      await deleteHomework.mutateAsync(deleteModal.id)
      showToast('Homework deleted successfully', 'success')
      setDeleteModal({ isOpen: false, id: '', title: '' })
    } catch {
      showToast('Failed to delete homework', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  }

  const isDueToday = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dueDate === today
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-600 mt-1">
            {canCreate ? 'Manage homework assignments' : 'View homework assignments'}
          </p>
        </div>
        {canCreate && (
          <Link to="/homework/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Homework
            </Button>
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select
            options={classOptions}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            placeholder="Filter by class"
          />
        </div>
        <p className="text-sm text-gray-500">
          {filteredHomework?.length || 0} assignments
        </p>
      </div>

      {/* Homework List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHomework && filteredHomework.length > 0 ? (
        <div className="space-y-4">
          {filteredHomework.map((hw) => (
            <Card key={hw.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                      {isOverdue(hw.due_date) && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                      {isDueToday(hw.due_date) && (
                        <Badge variant="warning">Due Today</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {hw.subject?.name}
                      </span>
                      <Badge variant="secondary">{hw.class?.name}</Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(hw.due_date)}
                      </span>
                    </div>

                    {hw.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {hw.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Assigned by {hw.assigned_by_profile?.full_name}
                    </p>
                  </div>

                  {canCreate && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/homework/${hw.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            id: hw.id,
                            title: hw.title,
                          })
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No homework assignments found</p>
          {canCreate && (
            <Link to="/homework/new">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Homework
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        title="Delete Homework"
      >
        <p className="text-gray-600">
          Are you sure you want to delete "<strong>{deleteModal.title}</strong>"?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteHomework.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
