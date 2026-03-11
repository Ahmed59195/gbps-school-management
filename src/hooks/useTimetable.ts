import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TimetableEntry, TimetableEntryWithDetails } from '../lib/types'

export function useClassTimetable(classId: string | undefined) {
  return useQuery({
    queryKey: ['timetable', classId],
    queryFn: async () => {
      if (!classId) return []

      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          subject:subjects(id, name),
          teacher:profiles(id, full_name)
        `)
        .eq('class_id', classId)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error
      return data as TimetableEntryWithDetails[]
    },
    enabled: !!classId,
  })
}

interface TimetableEntryData {
  class_id: string
  subject_id: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export function useUpsertTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TimetableEntryData) => {
      // Check if entry already exists for this class, day, and time
      const { data: existing } = await supabase
        .from('timetable')
        .select('id')
        .eq('class_id', data.class_id)
        .eq('day_of_week', data.day_of_week)
        .eq('start_time', data.start_time)
        .single()

      if (existing) {
        // Update existing entry
        const { data: updated, error } = await supabase
          .from('timetable')
          .update({
            subject_id: data.subject_id,
            teacher_id: data.teacher_id,
            end_time: data.end_time,
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return updated as TimetableEntry
      } else {
        // Insert new entry
        const { data: inserted, error } = await supabase
          .from('timetable')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return inserted as TimetableEntry
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.class_id] })
    },
  })
}

export function useBulkUpsertTimetable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ classId, entries }: { classId: string; entries: TimetableEntryData[] }) => {
      // Delete all existing entries for this class
      const { error: deleteError } = await supabase
        .from('timetable')
        .delete()
        .eq('class_id', classId)

      if (deleteError) throw deleteError

      // Insert all new entries (filter out empty ones)
      const validEntries = entries.filter(e => e.subject_id && e.teacher_id)

      if (validEntries.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('timetable')
        .insert(validEntries)
        .select()

      if (error) throw error
      return data as TimetableEntry[]
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.classId] })
    },
  })
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; classId: string }) => {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.classId] })
    },
  })
}
