import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Homework, HomeworkWithDetails } from '../lib/types'

export function useHomeworkByClass(classId: string | undefined) {
  return useQuery({
    queryKey: ['homework', 'class', classId],
    queryFn: async () => {
      if (!classId) return []

      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          class:classes(id, name),
          subject:subjects(id, name),
          assigned_by_profile:profiles(id, full_name)
        `)
        .eq('class_id', classId)
        .order('due_date', { ascending: false })

      if (error) throw error
      return data as HomeworkWithDetails[]
    },
    enabled: !!classId,
  })
}

export function useAllHomework() {
  return useQuery({
    queryKey: ['homework', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          class:classes(id, name),
          subject:subjects(id, name),
          assigned_by_profile:profiles(id, full_name)
        `)
        .order('due_date', { ascending: false })

      if (error) throw error
      return data as HomeworkWithDetails[]
    },
  })
}

export function useHomework(homeworkId: string | undefined) {
  return useQuery({
    queryKey: ['homework', homeworkId],
    queryFn: async () => {
      if (!homeworkId) return null

      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          class:classes(id, name),
          subject:subjects(id, name),
          assigned_by_profile:profiles(id, full_name)
        `)
        .eq('id', homeworkId)
        .single()

      if (error) throw error
      return data as HomeworkWithDetails
    },
    enabled: !!homeworkId,
  })
}

interface CreateHomeworkData {
  class_id: string
  subject_id: string
  title: string
  description?: string | null
  due_date: string
  assigned_by: string
}

export function useCreateHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateHomeworkData) => {
      const { data: homework, error } = await supabase
        .from('homework')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return homework as Homework
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] })
    },
  })
}

interface UpdateHomeworkData {
  id: string
  title?: string
  description?: string | null
  due_date?: string
}

export function useUpdateHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateHomeworkData) => {
      const { data: homework, error } = await supabase
        .from('homework')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return homework as Homework
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homework'] })
      queryClient.invalidateQueries({ queryKey: ['homework', variables.id] })
    },
  })
}

export function useDeleteHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (homeworkId: string) => {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] })
    },
  })
}
