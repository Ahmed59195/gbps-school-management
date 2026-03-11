-- GBPS D-1 Area School Management System
-- Supabase Database Schema
-- Version: 1.0.1
-- Generated: 2026-03-08

-- ============================================
-- 1. TABLES (must be created first)
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('headmaster', 'teacher', 'parent')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher-Class assignments (many-to-many)
CREATE TABLE public.teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, class_id)
);

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms table (academic terms)
CREATE TABLE public.terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_term_dates CHECK (end_date > start_date)
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE RESTRICT,
  marks NUMERIC(5,2) NOT NULL CHECK (marks >= 0),
  max_marks NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  grade_letter TEXT,
  entered_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term_id),
  CONSTRAINT valid_marks CHECK (marks <= max_marks)
);

-- Homework table
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable entries
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_slot CHECK (end_time > start_time),
  UNIQUE(class_id, day_of_week, start_time)
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'all' CHECK (target_role IN ('headmaster', 'teacher', 'parent', 'all')),
  target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_students_parent_id ON public.students(parent_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_grades_student_id ON public.grades(student_id);
CREATE INDEX idx_grades_term_id ON public.grades(term_id);
CREATE INDEX idx_homework_class_id ON public.homework(class_id);
CREATE INDEX idx_homework_due_date ON public.homework(due_date);
CREATE INDEX idx_timetable_class_day ON public.timetable_entries(class_id, day_of_week);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);

-- ============================================
-- 3. HELPER FUNCTIONS (for RLS policies)
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is headmaster
CREATE OR REPLACE FUNCTION public.is_headmaster()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'headmaster'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is parent
CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'parent'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get class IDs assigned to current teacher
CREATE OR REPLACE FUNCTION public.get_teacher_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM public.teacher_classes WHERE teacher_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get student IDs for current parent
CREATE OR REPLACE FUNCTION public.get_parent_student_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.students WHERE parent_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Headmaster can view all profiles" ON public.profiles
  FOR SELECT USING (is_headmaster());

CREATE POLICY "Teachers can view parent profiles" ON public.profiles
  FOR SELECT USING (
    is_teacher() AND role = 'parent'
  );

CREATE POLICY "Headmaster can manage profiles" ON public.profiles
  FOR ALL USING (is_headmaster());

-- CLASSES policies
CREATE POLICY "Anyone authenticated can view classes" ON public.classes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Headmaster can manage classes" ON public.classes
  FOR ALL USING (is_headmaster());

-- TEACHER_CLASSES policies
CREATE POLICY "Anyone authenticated can view teacher assignments" ON public.teacher_classes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Headmaster can manage teacher assignments" ON public.teacher_classes
  FOR ALL USING (is_headmaster());

-- STUDENTS policies
CREATE POLICY "Headmaster can view all students" ON public.students
  FOR SELECT USING (is_headmaster());

CREATE POLICY "Teachers can view students in their classes" ON public.students
  FOR SELECT USING (
    is_teacher() AND class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Parents can view their children" ON public.students
  FOR SELECT USING (
    is_parent() AND parent_id = auth.uid()
  );

CREATE POLICY "Headmaster can manage students" ON public.students
  FOR ALL USING (is_headmaster());

-- SUBJECTS policies
CREATE POLICY "Anyone authenticated can view subjects" ON public.subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Headmaster can manage subjects" ON public.subjects
  FOR ALL USING (is_headmaster());

-- TERMS policies
CREATE POLICY "Anyone authenticated can view terms" ON public.terms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Headmaster can manage terms" ON public.terms
  FOR ALL USING (is_headmaster());

-- ATTENDANCE policies
CREATE POLICY "Headmaster can view all attendance" ON public.attendance
  FOR SELECT USING (is_headmaster());

CREATE POLICY "Teachers can view attendance for their classes" ON public.attendance
  FOR SELECT USING (
    is_teacher() AND student_id IN (
      SELECT id FROM public.students WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Parents can view their children's attendance" ON public.attendance
  FOR SELECT USING (
    is_parent() AND student_id IN (SELECT get_parent_student_ids())
  );

CREATE POLICY "Headmaster can manage attendance" ON public.attendance
  FOR ALL USING (is_headmaster());

CREATE POLICY "Teachers can mark attendance for their classes" ON public.attendance
  FOR INSERT WITH CHECK (
    is_teacher() AND student_id IN (
      SELECT id FROM public.students WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Teachers can update attendance they marked" ON public.attendance
  FOR UPDATE USING (
    is_teacher() AND marked_by = auth.uid()
  );

-- GRADES policies
CREATE POLICY "Headmaster can view all grades" ON public.grades
  FOR SELECT USING (is_headmaster());

CREATE POLICY "Teachers can view grades for their classes" ON public.grades
  FOR SELECT USING (
    is_teacher() AND student_id IN (
      SELECT id FROM public.students WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Parents can view their children's grades" ON public.grades
  FOR SELECT USING (
    is_parent() AND student_id IN (SELECT get_parent_student_ids())
  );

CREATE POLICY "Headmaster can manage grades" ON public.grades
  FOR ALL USING (is_headmaster());

CREATE POLICY "Teachers can enter grades for their classes" ON public.grades
  FOR INSERT WITH CHECK (
    is_teacher() AND student_id IN (
      SELECT id FROM public.students WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Teachers can update grades they entered" ON public.grades
  FOR UPDATE USING (
    is_teacher() AND entered_by = auth.uid()
  );

-- HOMEWORK policies
CREATE POLICY "Headmaster can view all homework" ON public.homework
  FOR SELECT USING (is_headmaster());

CREATE POLICY "Teachers can view homework for their classes" ON public.homework
  FOR SELECT USING (
    is_teacher() AND class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Parents can view homework for their children's classes" ON public.homework
  FOR SELECT USING (
    is_parent() AND class_id IN (
      SELECT class_id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Headmaster can manage homework" ON public.homework
  FOR ALL USING (is_headmaster());

CREATE POLICY "Teachers can create homework for their classes" ON public.homework
  FOR INSERT WITH CHECK (
    is_teacher() AND class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can update their own homework" ON public.homework
  FOR UPDATE USING (
    is_teacher() AND assigned_by = auth.uid()
  );

CREATE POLICY "Teachers can delete their own homework" ON public.homework
  FOR DELETE USING (
    is_teacher() AND assigned_by = auth.uid()
  );

-- TIMETABLE_ENTRIES policies
CREATE POLICY "Anyone authenticated can view timetable" ON public.timetable_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Headmaster can manage timetable" ON public.timetable_entries
  FOR ALL USING (is_headmaster());

-- ANNOUNCEMENTS policies
CREATE POLICY "Users can view announcements for their role" ON public.announcements
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      target_role = 'all' OR
      target_role = get_user_role() OR
      is_headmaster()
    )
  );

CREATE POLICY "Headmaster can manage announcements" ON public.announcements
  FOR ALL USING (is_headmaster());

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_students
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_grades
  BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_homework
  BEFORE UPDATE ON public.homework
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_announcements
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure only one current term
CREATE OR REPLACE FUNCTION public.ensure_single_current_term()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE public.terms SET is_current = FALSE WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_current_term
  AFTER INSERT OR UPDATE ON public.terms
  FOR EACH ROW EXECUTE FUNCTION ensure_single_current_term();
