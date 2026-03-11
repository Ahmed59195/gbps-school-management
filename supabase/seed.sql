-- GBPS D-1 Area School Management System
-- Seed Data for Development/Testing
-- Run this in Supabase SQL Editor
-- Date: 2026-03-10

-- ============================================
-- 1. SEED CLASSES (Grades 1-5)
-- ============================================

INSERT INTO public.classes (name)
SELECT name FROM (VALUES
  ('Grade 1'),
  ('Grade 2'),
  ('Grade 3'),
  ('Grade 4'),
  ('Grade 5')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE classes.name = v.name);

-- ============================================
-- 2. SEED SUBJECTS
-- ============================================

INSERT INTO public.subjects (name)
SELECT name FROM (VALUES
  ('English'),
  ('Urdu'),
  ('Mathematics'),
  ('Science'),
  ('Social Studies'),
  ('Islamiat'),
  ('Art'),
  ('Physical Education')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE subjects.name = v.name);

-- ============================================
-- 3. SEED TERMS (Academic Year 2025-2026)
-- ============================================

INSERT INTO public.terms (name, start_date, end_date, is_current)
SELECT * FROM (VALUES
  ('First Term', '2025-04-01'::date, '2025-08-31'::date, FALSE),
  ('Second Term', '2025-09-01'::date, '2025-12-31'::date, FALSE),
  ('Third Term', '2026-01-01'::date, '2026-03-31'::date, TRUE)
) AS v(name, start_date, end_date, is_current)
WHERE NOT EXISTS (SELECT 1 FROM public.terms WHERE terms.name = v.name);

-- ============================================
-- 4. VERIFY SEED DATA
-- ============================================

SELECT 'Classes' as table_name, count(*) as count FROM public.classes
UNION ALL
SELECT 'Subjects' as table_name, count(*) as count FROM public.subjects
UNION ALL
SELECT 'Terms' as table_name, count(*) as count FROM public.terms;

-- ============================================
-- 5. SAMPLE STUDENTS (Run after creating users)
-- ============================================

-- First get the class IDs:
-- SELECT id, name FROM public.classes;

-- Then insert students with real class_id values:
-- This will be done after user creation

-- ============================================
-- 6. ASSIGN TEACHERS TO CLASSES (Run after creating users)
-- ============================================

-- INSERT INTO public.teacher_classes (teacher_id, class_id)
-- SELECT p.id, c.id FROM public.profiles p, public.classes c
-- WHERE p.email = 'teacher1@gbps.edu' AND c.name = 'Grade 1';
