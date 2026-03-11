import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Student, StudentWithClass } from '../lib/types'

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          parent:profiles(id, full_name, email, phone)
        `)
        .order('name')

      if (error) throw error
      return data as StudentWithClass[]
    },
  })
}

export function useStudentsByClass(classId: string | undefined) {
  return useQuery({
    queryKey: ['students', 'class', classId],
    queryFn: async () => {
      if (!classId) return []

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          parent:profiles(id, full_name, email, phone)
        `)
        .eq('class_id', classId)
        .order('name')

      if (error) throw error
      return data as StudentWithClass[]
    },
    enabled: !!classId,
  })
}

export function useStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          parent:profiles(id, full_name, email, phone)
        `)
        .eq('id', studentId)
        .single()

      if (error) throw error
      return data as StudentWithClass
    },
    enabled: !!studentId,
  })
}

interface CreateStudentData {
  name: string
  class_id: string
  parent_id?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | null
  address?: string | null
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const { data: student, error } = await supabase
        .from('students')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return student as Student
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

interface UpdateStudentData {
  id: string
  name?: string
  class_id?: string
  parent_id?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | null
  address?: string | null
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateStudentData) => {
      const { data: student, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return student as Student
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
