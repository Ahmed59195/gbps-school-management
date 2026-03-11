export type Role = 'headmaster' | 'teacher' | 'parent'

export interface Profile {
  id: string
  role: Role
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  created_at: string
}

export interface TeacherClass {
  id: string
  teacher_id: string
  class_id: string
  created_at: string
}

export interface Student {
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

export interface Attendance {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  marked_by: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  created_at: string
}

export interface Term {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Grade {
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

export interface Homework {
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

export interface TimetableEntry {
  id: string
  class_id: string
  subject_id: string
  teacher_id: string
  day_of_week: number // 0 = Monday, 6 = Sunday
  start_time: string
  end_time: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  target_role: Role | 'all'
  target_class_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface StudentWithClass extends Student {
  class: Class
  parent: Profile | null
}

export interface AttendanceWithStudent extends Attendance {
  student: Student
}

export interface GradeWithDetails extends Grade {
  student: Student
  subject: Subject
  term: Term
}

export interface HomeworkWithDetails extends Homework {
  class: Class
  subject: Subject
  assigned_by_profile: Profile
}

export interface TimetableEntryWithDetails extends TimetableEntry {
  subject: Subject
  teacher: Profile
}

export interface AnnouncementWithCreator extends Announcement {
  created_by_profile: Profile
}
