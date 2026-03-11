import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Attendance, AttendanceWithStudent } from '../lib/types'

export function useAttendanceByDate(classId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      if (!classId || !date) return []

      // First get student IDs for this class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)

      if (studentsError) throw studentsError
      if (!students || students.length === 0) return []

      const studentIds = students.map(s => s.id)

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(id, name, class_id)
        `)
        .eq('date', date)
        .in('student_id', studentIds)
        .order('created_at')

      if (error) throw error
      return data as AttendanceWithStudent[]
    },
    enabled: !!classId && !!date,
  })
}

export function useAttendanceByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return []

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })

      if (error) throw error
      return data as Attendance[]
    },
    enabled: !!studentId,
  })
}

interface MarkAttendanceData {
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  marked_by: string
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: MarkAttendanceData[]) => {
      // Use upsert to handle both insert and update
      const { data, error } = await supabase
        .from('attendance')
        .upsert(records, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false,
        })
        .select()

      if (error) throw error
      return data as Attendance[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'present' | 'absent' | 'late'
    }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

// Get attendance stats for a class
export function useAttendanceStats(classId: string | undefined, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance-stats', classId, startDate, endDate],
    queryFn: async () => {
      if (!classId) return null

      let query = supabase
        .from('attendance')
        .select(`
          status,
          student:students!inner(class_id)
        `)
        .eq('student.class_id', classId)

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data.length,
        present: data.filter((r) => r.status === 'present').length,
        absent: data.filter((r) => r.status === 'absent').length,
        late: data.filter((r) => r.status === 'late').length,
      }

      return {
        ...stats,
        presentRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0',
        absentRate: stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : '0',
      }
    },
    enabled: !!classId,
  })
}
