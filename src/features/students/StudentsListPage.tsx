import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { useStudents, useDeleteStudent } from '../../hooks/useStudents'
import { useClasses } from '../../hooks/useClasses'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal, ModalFooter } from '../../components/ui/Modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableLoading,
  TableEmpty,
} from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'

export function StudentsListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: students, isLoading, error } = useStudents()
  const { data: classes } = useClasses()
  const deleteStudent = useDeleteStudent()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; studentId: string; studentName: string }>({
    isOpen: false,
    studentId: '',
    studentName: '',
  })

  // Filter students based on search and class filter
  const filteredStudents = students?.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !filterClass || student.class_id === filterClass
    return matchesSearch && matchesClass
  })

  const handleDelete = async () => {
    try {
      await deleteStudent.mutateAsync(deleteModal.studentId)
      showToast('Student deleted successfully', 'success')
      setDeleteModal({ isOpen: false, studentId: '', studentName: '' })
    } catch (err) {
      showToast('Failed to delete student', 'error')
    }
  }

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...(classes?.map((c) => ({ value: c.id, label: c.name })) || []),
  ]

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading students: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">
            Manage all students in the school
          </p>
        </div>
        <Link to="/students/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select
            options={classOptions}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Filtered</p>
          <p className="text-2xl font-bold text-gray-900">{filteredStudents?.length || 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="hidden sm:table-cell">Gender</TableHead>
              <TableHead className="hidden md:table-cell">Parent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableLoading columns={5} rows={5} />
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.class?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">
                    {student.gender || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.parent?.full_name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/students/${student.id}`)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/students/${student.id}/edit`)}
                        title="Edit student"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            studentId: student.id,
                            studentName: student.name,
                          })
                        }
                        title="Delete student"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableEmpty columns={5} message="No students found" />
          )}
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, studentId: '', studentName: '' })}
        title="Delete Student"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{deleteModal.studentName}</strong>? This action
          cannot be undone and will also delete all associated attendance and grade records.
        </p>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ isOpen: false, studentId: '', studentName: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteStudent.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
