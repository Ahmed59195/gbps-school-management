-- GBPS D-1 Area School Management System
-- Initial Database Schema Migration
-- Date: 2026-03-10

-- ============================================
-- PART 1: HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 2: TABLES
-- ============================================

-- Table: profiles (links to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('headmaster', 'teacher', 'parent')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: teacher_classes (junction table)
CREATE TABLE teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, class_id)
);

CREATE INDEX idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_class ON teacher_classes(class_id);

-- Table: students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_status ON students(status);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: subjects (reference table)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL
);

-- Table: terms (reference table)
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  academic_year TEXT NOT NULL,
  display_order INT NOT NULL
);

-- Table: attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE RESTRICT,
  marks NUMERIC(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  entered_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term_id)
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_term ON grades(term_id);

CREATE TRIGGER grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: homework
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homework_class ON homework(class_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);

CREATE TRIGGER homework_updated_at
  BEFORE UPDATE ON homework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: timetable_entries
CREATE TABLE timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, period_number)
);

CREATE INDEX idx_timetable_class ON timetable_entries(class_id);

CREATE TRIGGER timetable_entries_updated_at
  BEFORE UPDATE ON timetable_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Table: announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PART 3: SEED DATA (Reference Tables)
-- ============================================

-- Seed subjects
INSERT INTO subjects (name, display_order) VALUES
  ('English', 1),
  ('Urdu', 2),
  ('Math', 3),
  ('Science', 4),
  ('Social Studies', 5),
  ('Islamiat', 6);

-- Seed terms
INSERT INTO terms (name, academic_year, display_order) VALUES
  ('First Term', '2026', 1),
  ('Second Term', '2026', 2),
  ('Third Term', '2026', 3);

-- Seed classes (Grade 1 through Grade 5)
INSERT INTO classes (name, description) VALUES
  ('Grade 1', 'First grade students'),
  ('Grade 2', 'Second grade students'),
  ('Grade 3', 'Third grade students'),
  ('Grade 4', 'Fourth grade students'),
  ('Grade 5', 'Fifth grade students');

-- ============================================
-- PART 4: DATABASE VIEWS
-- ============================================

-- View: student_with_class
CREATE VIEW student_with_class AS
SELECT
  s.*,
  c.name as class_name,
  p.full_name as parent_name
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN profiles p ON s.parent_id = p.id;

-- View: attendance_summary
CREATE VIEW attendance_summary AS
SELECT
  class_id,
  date,
  COUNT(*) FILTER (WHERE status = 'present') as present_count,
  COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
  COUNT(*) FILTER (WHERE status = 'late') as late_count,
  COUNT(*) as total_students
FROM attendance
GROUP BY class_id, date;

-- View: class_teacher
CREATE VIEW class_teacher AS
SELECT
  c.id as class_id,
  c.name as class_name,
  p.id as teacher_id,
  p.full_name as teacher_name
FROM classes c
JOIN teacher_classes tc ON c.id = tc.class_id AND tc.is_primary = true
JOIN profiles p ON tc.teacher_id = p.id;
