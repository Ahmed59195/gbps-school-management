import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Grade, GradeWithDetails } from '../lib/types'

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })
}

export function useTerms() {
  return useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useCurrentTerm() {
  return useQuery({
    queryKey: ['current-term'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('is_current', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
  })
}

export function useGradesByClass(
  classId: string | undefined,
  subjectId: string | undefined,
  termId: string | undefined
) {
  return useQuery({
    queryKey: ['grades', classId, subjectId, termId],
    queryFn: async () => {
      if (!classId || !subjectId || !termId) return []

      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          student:students!inner(id, name, class_id),
          subject:subjects(id, name),
          term:terms(id, name)
        `)
        .eq('student.class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term_id', termId)
        .order('student.name')

      if (error) throw error
      return data as GradeWithDetails[]
    },
    enabled: !!classId && !!subjectId && !!termId,
  })
}

export function useGradesByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ['grades', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return []

      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(id, name),
          term:terms(id, name)
        `)
        .eq('student_id', studentId)
        .order('term_id')

      if (error) throw error
      return data
    },
    enabled: !!studentId,
  })
}

interface UpsertGradeData {
  student_id: string
  subject_id: string
  term_id: string
  marks: number
  max_marks: number
  grade_letter?: string | null
  entered_by: string
}

export function useUpsertGrades() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (grades: UpsertGradeData[]) => {
      // Calculate grade letters
      const gradesWithLetters = grades.map((g) => ({
        ...g,
        grade_letter: calculateGradeLetter(g.marks, g.max_marks),
      }))

      const { data, error } = await supabase
        .from('grades')
        .upsert(gradesWithLetters, {
          onConflict: 'student_id,subject_id,term_id',
          ignoreDuplicates: false,
        })
        .select()

      if (error) throw error
      return data as Grade[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
    },
  })
}

// Helper function to calculate grade letter
function calculateGradeLetter(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100

  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}
