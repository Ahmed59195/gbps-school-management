import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Megaphone, Trash2, Pencil, Users } from 'lucide-react'
import { useAnnouncements, useDeleteAnnouncement } from '../../hooks/useAnnouncements'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal, ModalFooter } from '../../components/ui/Modal'

export function AnnouncementsListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()
  const isHeadmaster = profile?.role === 'headmaster'

  const { data: announcements, isLoading } = useAnnouncements()
  const deleteAnnouncement = useDeleteAnnouncement()

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  })

  const handleDelete = async () => {
    try {
      await deleteAnnouncement.mutateAsync(deleteModal.id)
      showToast('Announcement deleted successfully', 'success')
      setDeleteModal({ isOpen: false, id: '', title: '' })
    } catch (err) {
      showToast('Failed to delete announcement', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'all':
        return 'primary'
      case 'teacher':
        return 'info'
      case 'parent':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'all':
        return 'Everyone'
      case 'headmaster':
        return 'Headmaster'
      case 'teacher':
        return 'Teachers'
      case 'parent':
        return 'Parents'
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">
            {isHeadmaster ? 'Manage school announcements' : 'View school announcements'}
          </p>
        </div>
        {isHeadmaster && (
          <Link to="/announcements/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="h-5 w-5 text-primary-500" />
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <Badge variant={getRoleBadgeVariant(announcement.target_role) as any}>
                          {getRoleLabel(announcement.target_role)}
                        </Badge>
                      </div>
                      <span>
                        Posted {formatDate(announcement.created_at)}
                      </span>
                      <span>
                        by {announcement.created_by_profile?.full_name}
                      </span>
                    </div>
                  </div>

                  {isHeadmaster && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            id: announcement.id,
                            title: announcement.title,
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
          <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No announcements yet</p>
          {isHeadmaster && (
            <Link to="/announcements/new">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Announcement
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        title="Delete Announcement"
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
            isLoading={deleteAnnouncement.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
