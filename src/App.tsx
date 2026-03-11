import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ui/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { UnauthorizedPage } from './features/auth/UnauthorizedPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { HeadmasterDashboard } from './features/dashboard/HeadmasterDashboard'
import { TeacherDashboard } from './features/dashboard/TeacherDashboard'
import { ParentDashboard } from './features/dashboard/ParentDashboard'
import { SkeletonDashboard } from './components/ui/Skeleton'
import { StudentsListPage, StudentFormPage, StudentDetailsPage } from './features/students'
import { AttendanceOverviewPage, MarkAttendancePage, AttendanceHistoryPage } from './features/attendance'
import { GradesOverviewPage, EnterGradesPage } from './features/grades'
import { HomeworkListPage, HomeworkFormPage } from './features/homework'
import { TimetablePage, EditTimetablePage } from './features/timetable'
import { AnnouncementsListPage, AnnouncementFormPage } from './features/announcements'
import { ReportsPage, AttendanceReportPage, GradeReportPage } from './features/reports'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Dashboard router based on role
function DashboardRouter() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <SkeletonDashboard />
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  switch (profile.role) {
    case 'headmaster':
      return <HeadmasterDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'parent':
      return <ParentDashboard />
    default:
      return <Navigate to="/unauthorized" replace />
  }
}

function AppRoutes() {
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Management - Headmaster only */}
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <StudentsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/new"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <StudentFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <StudentDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <StudentFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Attendance */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AttendanceOverviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/mark"
        element={
          <ProtectedRoute allowedRoles={['headmaster', 'teacher']}>
            <DashboardLayout>
              <MarkAttendancePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/history"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AttendanceHistoryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Grades */}
      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <GradesOverviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades/enter"
        element={
          <ProtectedRoute allowedRoles={['headmaster', 'teacher']}>
            <DashboardLayout>
              <EnterGradesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Homework */}
      <Route
        path="/homework"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomeworkListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/homework/new"
        element={
          <ProtectedRoute allowedRoles={['headmaster', 'teacher']}>
            <DashboardLayout>
              <HomeworkFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/homework/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['headmaster', 'teacher']}>
            <DashboardLayout>
              <HomeworkFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Timetable */}
      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TimetablePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable/:classId/edit"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <EditTimetablePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Announcements - Headmaster only for management */}
      <Route
        path="/announcements"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <AnnouncementsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/new"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <AnnouncementFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <AnnouncementFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports - Headmaster only */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <ReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <AttendanceReportPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/grades"
        element={
          <ProtectedRoute allowedRoles={['headmaster']}>
            <DashboardLayout>
              <GradeReportPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
