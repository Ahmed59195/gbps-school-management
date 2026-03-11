# GBPS D-1 School Management System - Testing Checklist

**Version**: 1.0
**Date**: 2026-03-11
**Purpose**: Complete manual testing checklist for all user flows

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Headmaster | headmaster@gbps-d1.edu | headmaster123 |
| Teacher | teacher1@gbps-d1.edu | teacher123 |
| Parent | parent1@gbps-d1.edu | parent123 |

---

## Pre-Testing Setup

- [ ] Start development server: `npm run dev`
- [ ] Verify app loads at http://localhost:5173
- [ ] Clear browser cache/cookies before testing each role
- [ ] Have Supabase dashboard open to verify data changes

---

## 1. Authentication (US1)

### 1.1 Login Flow
- [ ] Navigate to /login
- [ ] Verify login form displays with email and password fields
- [ ] Try logging in with invalid credentials - verify error message appears
- [ ] Try logging in with empty fields - verify validation errors
- [ ] Log in as Headmaster - verify redirect to Headmaster dashboard
- [ ] Log out
- [ ] Log in as Teacher - verify redirect to Teacher dashboard
- [ ] Log out
- [ ] Log in as Parent - verify redirect to Parent dashboard
- [ ] Log out

### 1.2 Session Persistence
- [ ] Log in as any user
- [ ] Refresh the page - verify user remains logged in
- [ ] Close and reopen browser - verify session persists

### 1.3 Protected Routes
- [ ] While logged out, try to access / (dashboard) - verify redirect to /login
- [ ] While logged in as Parent, try to access /students - verify redirect to /unauthorized
- [ ] While logged in as Teacher, try to access /reports - verify redirect to /unauthorized

### 1.4 Logout
- [ ] Click logout button in header
- [ ] Verify redirect to login page
- [ ] Verify cannot access protected routes after logout

---

## 2. Headmaster User Flows

### 2.1 Dashboard (US1)
- [ ] Log in as Headmaster
- [ ] Verify dashboard displays with correct greeting
- [ ] Verify total students count widget displays
- [ ] Verify today's attendance summary widget displays
- [ ] Verify recent announcements widget displays
- [ ] Verify all navigation links are visible in sidebar

### 2.2 Student Management (US2)

#### View Students
- [ ] Navigate to /students from sidebar
- [ ] Verify student list table displays
- [ ] Verify columns: Name, Class, Gender, Parent, Actions
- [ ] Verify class filter dropdown works
- [ ] Verify search by student name works
- [ ] Verify empty state shows when no results

#### Add Student
- [ ] Click "Add Student" button
- [ ] Verify form displays with all fields: Name, DOB, Gender, Class, Parent
- [ ] Try submitting empty form - verify validation errors
- [ ] Fill in valid data and submit
- [ ] Verify success toast notification
- [ ] Verify redirect to student list
- [ ] Verify new student appears in list

#### Edit Student
- [ ] Click edit button on a student row
- [ ] Verify form pre-fills with student data
- [ ] Modify student name
- [ ] Submit form
- [ ] Verify success toast notification
- [ ] Verify student name updated in list

#### View Student Details
- [ ] Click on a student name in the list
- [ ] Verify student details page displays
- [ ] Verify student information shows correctly
- [ ] Verify attendance summary displays
- [ ] Verify recent grades display

#### Delete Student
- [ ] Click delete button on a student row
- [ ] Verify confirmation modal appears
- [ ] Click cancel - verify modal closes, student not deleted
- [ ] Click delete again and confirm
- [ ] Verify success toast notification
- [ ] Verify student removed from list

### 2.3 Attendance (US3)

#### Mark Attendance
- [ ] Navigate to /attendance/mark
- [ ] Select a class from dropdown
- [ ] Select a date
- [ ] Verify student list loads for that class
- [ ] Mark students as present/absent/late using toggles
- [ ] Click Save button
- [ ] Verify success toast notification

#### View Attendance History
- [ ] Navigate to /attendance/history
- [ ] Select class filter
- [ ] Select date range
- [ ] Verify attendance records display
- [ ] Verify statistics (present/absent/late counts) display

### 2.4 Grades (US4)

#### Enter Grades
- [ ] Navigate to /grades/enter
- [ ] Select a class
- [ ] Select a subject
- [ ] Select a term
- [ ] Verify student list loads
- [ ] Enter marks for students (0-100)
- [ ] Try entering invalid marks (negative or >100) - verify validation
- [ ] Save grades
- [ ] Verify success toast notification

#### View Grades
- [ ] Navigate to /grades
- [ ] Apply class/subject/term filters
- [ ] Verify grades table displays correctly
- [ ] Verify grades match what was entered

### 2.5 Homework (US5)

#### Create Homework
- [ ] Navigate to /homework
- [ ] Click "Add Homework" button
- [ ] Verify form displays
- [ ] Fill in: Title, Description, Due Date, Class
- [ ] Submit form
- [ ] Verify success toast notification
- [ ] Verify homework appears in list

#### Edit Homework
- [ ] Click edit button on a homework item
- [ ] Verify form pre-fills with homework data
- [ ] Modify title
- [ ] Submit
- [ ] Verify success toast notification
- [ ] Verify homework updated in list

#### Delete Homework
- [ ] Click delete button on a homework item
- [ ] Verify confirmation modal
- [ ] Confirm delete
- [ ] Verify success toast
- [ ] Verify homework removed from list

### 2.6 Timetable (US6)

#### View Timetable
- [ ] Navigate to /timetable
- [ ] Select a class
- [ ] Verify weekly grid displays (Mon-Sat x 8 periods)
- [ ] Verify subjects show in appropriate slots

#### Edit Timetable
- [ ] Click Edit button
- [ ] Verify editable grid displays
- [ ] Modify a subject slot
- [ ] Save changes
- [ ] Verify success toast
- [ ] Verify changes reflected in view mode

### 2.7 Announcements (US7)

#### Create Announcement
- [ ] Navigate to /announcements
- [ ] Click "New Announcement" button
- [ ] Verify form displays
- [ ] Fill in title and content
- [ ] Submit
- [ ] Verify success toast
- [ ] Verify announcement appears in list

#### Edit Announcement
- [ ] Click edit button on an announcement
- [ ] Verify form pre-fills
- [ ] Modify content
- [ ] Submit
- [ ] Verify success toast
- [ ] Verify announcement updated

#### Delete Announcement
- [ ] Click delete button on an announcement
- [ ] Verify confirmation modal
- [ ] Confirm delete
- [ ] Verify success toast
- [ ] Verify announcement removed

### 2.8 Reports (US8)

#### Attendance Report
- [ ] Navigate to /reports
- [ ] Click "Attendance Report" card
- [ ] Select a class
- [ ] Select a month/date range
- [ ] Verify attendance summary table displays
- [ ] Click "Download PDF" button
- [ ] Verify PDF downloads with correct data
- [ ] Open PDF and verify GBPS D-1 branding appears

#### Grade Report
- [ ] Navigate to /reports
- [ ] Click "Grade Report" card
- [ ] Select a student
- [ ] Select a term
- [ ] Verify grade summary table displays
- [ ] Click "Download PDF" button
- [ ] Verify PDF downloads with correct data
- [ ] Open PDF and verify GBPS D-1 branding appears

---

## 3. Teacher User Flows

### 3.1 Dashboard (US1)
- [ ] Log in as Teacher
- [ ] Verify dashboard displays with correct greeting
- [ ] Verify today's attendance status widget displays
- [ ] Verify pending homework count widget displays
- [ ] Verify recent announcements widget displays
- [ ] Verify sidebar shows only allowed links (no Students, Reports, Announcements management)

### 3.2 Attendance (US3)

#### Mark Attendance
- [ ] Navigate to /attendance/mark
- [ ] Verify only assigned classes appear in dropdown (or auto-selected)
- [ ] Select date and mark attendance
- [ ] Save and verify success toast

#### View Attendance
- [ ] Navigate to /attendance/history
- [ ] Verify can view attendance for assigned classes

### 3.3 Grades (US4)

#### Enter Grades
- [ ] Navigate to /grades/enter
- [ ] Verify only assigned classes appear
- [ ] Enter grades for students
- [ ] Save and verify success toast

#### View Grades
- [ ] Navigate to /grades
- [ ] Verify can view grades for assigned classes

### 3.4 Homework (US5)

#### Create Homework
- [ ] Navigate to /homework
- [ ] Click "Add Homework"
- [ ] Verify only assigned classes appear in dropdown
- [ ] Create homework assignment
- [ ] Verify success toast and homework appears in list

#### Edit Homework
- [ ] Edit own homework assignment
- [ ] Verify success

#### Delete Homework
- [ ] Delete own homework assignment
- [ ] Verify success

### 3.5 Timetable (US6)
- [ ] Navigate to /timetable
- [ ] Verify auto-selects assigned class OR shows dropdown
- [ ] Verify cannot access edit mode (Headmaster only)

### 3.6 Access Restrictions
- [ ] Try navigating to /students - verify redirected to /unauthorized
- [ ] Try navigating to /reports - verify redirected to /unauthorized
- [ ] Try navigating to /announcements - verify redirected to /unauthorized

---

## 4. Parent User Flows

### 4.1 Dashboard (US1)
- [ ] Log in as Parent
- [ ] Verify dashboard displays with correct greeting
- [ ] Verify child's recent attendance (last 7 days) widget displays
- [ ] Verify child's latest grades widget displays
- [ ] Verify upcoming homework list displays
- [ ] Verify recent announcements widget displays
- [ ] Verify sidebar shows only allowed links

### 4.2 Attendance (US3)
- [ ] Navigate to /attendance
- [ ] Verify only shows linked child's attendance records
- [ ] Verify cannot access /attendance/mark
- [ ] Navigate to /attendance/history
- [ ] Verify only child's records visible

### 4.3 Grades (US4)
- [ ] Navigate to /grades
- [ ] Verify only shows linked child's grades
- [ ] Verify cannot access /grades/enter

### 4.4 Homework (US5)
- [ ] Navigate to /homework
- [ ] Verify shows homework for child's class
- [ ] Verify cannot create/edit/delete homework (buttons not visible)
- [ ] Verify past-due homework has different badge color

### 4.5 Timetable (US6)
- [ ] Navigate to /timetable
- [ ] Verify auto-selects child's class
- [ ] Verify can view timetable but cannot edit

### 4.6 Access Restrictions
- [ ] Try navigating to /students - verify redirected to /unauthorized
- [ ] Try navigating to /reports - verify redirected to /unauthorized
- [ ] Try navigating to /announcements - verify redirected to /unauthorized
- [ ] Try navigating to /attendance/mark - verify redirected to /unauthorized
- [ ] Try navigating to /grades/enter - verify redirected to /unauthorized
- [ ] Try navigating to /homework/new - verify redirected to /unauthorized

---

## 5. Responsive Design Tests

### 5.1 Mobile (375px viewport)
- [ ] Login page displays correctly
- [ ] Sidebar collapses to hamburger menu
- [ ] Hamburger menu opens/closes correctly
- [ ] All forms are usable on mobile
- [ ] Tables scroll horizontally if needed
- [ ] Touch targets are minimum 44x44px
- [ ] PDF download buttons work

### 5.2 Tablet (768px viewport)
- [ ] Layout adjusts appropriately
- [ ] Sidebar behaves correctly
- [ ] Tables display properly
- [ ] Forms are usable

### 5.3 Desktop (1024px+ viewport)
- [ ] Sidebar displays expanded
- [ ] Tables have adequate spacing
- [ ] Dashboard widgets display in grid

---

## 6. Error Handling Tests

### 6.1 Network Errors
- [ ] Disable network and try to load data - verify error message displays
- [ ] Re-enable network and verify data loads

### 6.2 Form Validation
- [ ] Submit forms with invalid data - verify validation messages
- [ ] Submit forms with required fields empty - verify error messages

### 6.3 API Errors
- [ ] Try to delete a student with related records - verify appropriate error
- [ ] Verify toast notifications appear for all error states

---

## 7. Loading States

- [ ] Verify loading skeletons appear on list pages while data fetches
- [ ] Verify loading spinners on form submit buttons
- [ ] Verify dashboard widgets show loading state

---

## 8. Empty States

- [ ] Verify empty state message when no students exist
- [ ] Verify empty state when no attendance records found
- [ ] Verify empty state when no grades exist
- [ ] Verify empty state when no homework assignments exist
- [ ] Verify empty state when no announcements exist

---

## 9. Build & Deploy Verification

- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run preview` - verify production build works locally
- [ ] Verify all TypeScript compiles without errors
- [ ] Verify no console errors in browser

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| Authentication | 15 | | | |
| Headmaster | 45 | | | |
| Teacher | 20 | | | |
| Parent | 15 | | | |
| Responsive | 12 | | | |
| Error Handling | 5 | | | |
| Loading/Empty States | 10 | | | |
| Build Verification | 4 | | | |
| **Total** | **126** | | | |

---

## Notes

_Record any bugs, issues, or observations during testing:_

1.
2.
3.

---

## Sign-off

| Tester | Date | Signature |
|--------|------|-----------|
| | | |
