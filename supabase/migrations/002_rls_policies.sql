-- GBPS D-1 Area School Management System
-- Row Level Security (RLS) Policies
-- Date: 2026-03-10

-- ============================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: HELPER FUNCTIONS
-- ============================================

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is headmaster
CREATE OR REPLACE FUNCTION is_headmaster()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'headmaster';
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'teacher';
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is parent
CREATE OR REPLACE FUNCTION is_parent()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'parent';
$$ LANGUAGE sql SECURITY DEFINER;

-- Get teacher's assigned class IDs
CREATE OR REPLACE FUNCTION get_teacher_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM teacher_classes WHERE teacher_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get parent's children IDs
CREATE OR REPLACE FUNCTION get_parent_student_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM students WHERE parent_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PART 3: PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Headmaster can view all profiles
CREATE POLICY "Headmaster can view all profiles"
  ON profiles FOR SELECT
  USING (is_headmaster());

-- Headmaster can insert profiles
CREATE POLICY "Headmaster can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_headmaster());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Headmaster can update any profile
CREATE POLICY "Headmaster can update any profile"
  ON profiles FOR UPDATE
  USING (is_headmaster());

-- ============================================
-- PART 4: CLASSES POLICIES
-- ============================================

-- Everyone can read classes
CREATE POLICY "All users can view classes"
  ON classes FOR SELECT
  USING (true);

-- Only headmaster can manage classes
CREATE POLICY "Headmaster can insert classes"
  ON classes FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update classes"
  ON classes FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete classes"
  ON classes FOR DELETE
  USING (is_headmaster());

-- ============================================
-- PART 5: TEACHER_CLASSES POLICIES
-- ============================================

-- Teachers can view their own assignments
CREATE POLICY "Teachers can view own class assignments"
  ON teacher_classes FOR SELECT
  USING (teacher_id = auth.uid());

-- Headmaster full access
CREATE POLICY "Headmaster can view all teacher_classes"
  ON teacher_classes FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can manage teacher_classes"
  ON teacher_classes FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update teacher_classes"
  ON teacher_classes FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete teacher_classes"
  ON teacher_classes FOR DELETE
  USING (is_headmaster());

-- ============================================
-- PART 6: STUDENTS POLICIES
-- ============================================

-- Headmaster full access
CREATE POLICY "Headmaster can view all students"
  ON students FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert students"
  ON students FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update students"
  ON students FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete students"
  ON students FOR DELETE
  USING (is_headmaster());

-- Teachers can read students in their classes
CREATE POLICY "Teachers can view their class students"
  ON students FOR SELECT
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

-- Parents can read their own children
CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  USING (
    is_parent() AND
    parent_id = auth.uid()
  );

-- ============================================
-- PART 7: ATTENDANCE POLICIES
-- ============================================

-- Headmaster full access
CREATE POLICY "Headmaster can view all attendance"
  ON attendance FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update attendance"
  ON attendance FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete attendance"
  ON attendance FOR DELETE
  USING (is_headmaster());

-- Teachers can manage attendance for their classes
CREATE POLICY "Teachers can view their class attendance"
  ON attendance FOR SELECT
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can insert class attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can update class attendance"
  ON attendance FOR UPDATE
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

-- Parents can read their children's attendance
CREATE POLICY "Parents can view children attendance"
  ON attendance FOR SELECT
  USING (
    is_parent() AND
    student_id IN (SELECT get_parent_student_ids())
  );

-- ============================================
-- PART 8: GRADES POLICIES
-- ============================================

-- Headmaster full access
CREATE POLICY "Headmaster can view all grades"
  ON grades FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert grades"
  ON grades FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update grades"
  ON grades FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete grades"
  ON grades FOR DELETE
  USING (is_headmaster());

-- Teachers can manage grades for their class students
CREATE POLICY "Teachers can view their class grades"
  ON grades FOR SELECT
  USING (
    is_teacher() AND
    student_id IN (
      SELECT id FROM students
      WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Teachers can insert class grades"
  ON grades FOR INSERT
  WITH CHECK (
    is_teacher() AND
    student_id IN (
      SELECT id FROM students
      WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

CREATE POLICY "Teachers can update class grades"
  ON grades FOR UPDATE
  USING (
    is_teacher() AND
    student_id IN (
      SELECT id FROM students
      WHERE class_id IN (SELECT get_teacher_class_ids())
    )
  );

-- Parents can read their children's grades
CREATE POLICY "Parents can view children grades"
  ON grades FOR SELECT
  USING (
    is_parent() AND
    student_id IN (SELECT get_parent_student_ids())
  );

-- ============================================
-- PART 9: HOMEWORK POLICIES
-- ============================================

-- Headmaster full access
CREATE POLICY "Headmaster can view all homework"
  ON homework FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert homework"
  ON homework FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update homework"
  ON homework FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete homework"
  ON homework FOR DELETE
  USING (is_headmaster());

-- Teachers can manage homework for their classes
CREATE POLICY "Teachers can view their class homework"
  ON homework FOR SELECT
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can insert class homework"
  ON homework FOR INSERT
  WITH CHECK (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can update class homework"
  ON homework FOR UPDATE
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

CREATE POLICY "Teachers can delete class homework"
  ON homework FOR DELETE
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

-- Parents can read homework for their children's classes
CREATE POLICY "Parents can view children class homework"
  ON homework FOR SELECT
  USING (
    is_parent() AND
    class_id IN (
      SELECT class_id FROM students
      WHERE id IN (SELECT get_parent_student_ids())
    )
  );

-- ============================================
-- PART 10: TIMETABLE POLICIES
-- ============================================

-- Headmaster full access
CREATE POLICY "Headmaster can view all timetable"
  ON timetable_entries FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert timetable"
  ON timetable_entries FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update timetable"
  ON timetable_entries FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete timetable"
  ON timetable_entries FOR DELETE
  USING (is_headmaster());

-- Teachers can read timetable for their classes
CREATE POLICY "Teachers can view their class timetable"
  ON timetable_entries FOR SELECT
  USING (
    is_teacher() AND
    class_id IN (SELECT get_teacher_class_ids())
  );

-- Parents can read timetable for their children's classes
CREATE POLICY "Parents can view children class timetable"
  ON timetable_entries FOR SELECT
  USING (
    is_parent() AND
    class_id IN (
      SELECT class_id FROM students
      WHERE id IN (SELECT get_parent_student_ids())
    )
  );

-- ============================================
-- PART 11: ANNOUNCEMENTS POLICIES
-- ============================================

-- Everyone can read active announcements
CREATE POLICY "All users can view active announcements"
  ON announcements FOR SELECT
  USING (is_active = true);

-- Headmaster full access
CREATE POLICY "Headmaster can view all announcements"
  ON announcements FOR SELECT
  USING (is_headmaster());

CREATE POLICY "Headmaster can insert announcements"
  ON announcements FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update announcements"
  ON announcements FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete announcements"
  ON announcements FOR DELETE
  USING (is_headmaster());

-- ============================================
-- PART 12: REFERENCE TABLES POLICIES
-- ============================================

-- Everyone can read subjects
CREATE POLICY "All users can view subjects"
  ON subjects FOR SELECT
  USING (true);

CREATE POLICY "Headmaster can insert subjects"
  ON subjects FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update subjects"
  ON subjects FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete subjects"
  ON subjects FOR DELETE
  USING (is_headmaster());

-- Everyone can read terms
CREATE POLICY "All users can view terms"
  ON terms FOR SELECT
  USING (true);

CREATE POLICY "Headmaster can insert terms"
  ON terms FOR INSERT
  WITH CHECK (is_headmaster());

CREATE POLICY "Headmaster can update terms"
  ON terms FOR UPDATE
  USING (is_headmaster());

CREATE POLICY "Headmaster can delete terms"
  ON terms FOR DELETE
  USING (is_headmaster());
