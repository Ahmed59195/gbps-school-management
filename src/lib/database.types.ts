export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'headmaster' | 'teacher' | 'parent'
          full_name: string
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'headmaster' | 'teacher' | 'parent'
          full_name: string
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'headmaster' | 'teacher' | 'parent'
          full_name?: string
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      teacher_classes: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          class_id: string
          parent_id: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | null
          address: string | null
          enrollment_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          class_id: string
          parent_id?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | null
          address?: string | null
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          class_id?: string
          parent_id?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | null
          address?: string | null
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          marked_by: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          marked_by: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late'
          marked_by?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      terms: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_current?: boolean
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          term_id: string
          marks: number
          max_marks: number
          grade_letter: string | null
          entered_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          term_id: string
          marks: number
          max_marks?: number
          grade_letter?: string | null
          entered_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          term_id?: string
          marks?: number
          max_marks?: number
          grade_letter?: string | null
          entered_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      homework: {
        Row: {
          id: string
          class_id: string
          subject_id: string
          title: string
          description: string | null
          due_date: string
          assigned_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          subject_id: string
          title: string
          description?: string | null
          due_date: string
          assigned_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          subject_id?: string
          title?: string
          description?: string | null
          due_date?: string
          assigned_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      timetable_entries: {
        Row: {
          id: string
          class_id: string
          subject_id: string
          teacher_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          subject_id: string
          teacher_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          subject_id?: string
          teacher_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          target_role: 'headmaster' | 'teacher' | 'parent' | 'all'
          target_class_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          target_role?: 'headmaster' | 'teacher' | 'parent' | 'all'
          target_class_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          target_role?: 'headmaster' | 'teacher' | 'parent' | 'all'
          target_class_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
      is_headmaster: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_teacher: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_parent: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_teacher_class_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_parent_student_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
