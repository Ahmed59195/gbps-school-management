import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Class } from '../lib/types'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Class[]
    },
  })
}

export function useClass(classId: string | undefined) {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      if (error) throw error
      return data as Class
    },
    enabled: !!classId,
  })
}

export function useTeacherClasses(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async () => {
      if (!teacherId) return []

      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          id,
          teacher_id,
          class_id,
          created_at,
          classes (
            id,
            name,
            created_at
          )
        `)
        .eq('teacher_id', teacherId)

      if (error) throw error
      // Cast through unknown first to handle Supabase's nested object typing
      return data as unknown as { id: string; teacher_id: string; class_id: string; created_at: string; classes: Class }[]
    },
    enabled: !!teacherId,
  })
}
