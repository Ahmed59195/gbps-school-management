# GBPS D-1 Area School Management System

A web-based school management system for GBPS D-1 Area, serving 165 students and 8 teachers. Built with React, TypeScript, and Supabase.

## Features

### User Roles
- **Headmaster**: Full access - manage students, teachers, attendance, grades, timetables, announcements, and reports
- **Teacher**: Mark attendance, enter grades, manage homework for assigned classes
- **Parent**: View child's attendance, grades, homework, and school announcements

### Core Modules
- Student Management (CRUD operations)
- Attendance Tracking (daily marking with present/absent/late status)
- Academic Grades (per subject, per term)
- Homework Assignments (with due dates and descriptions)
- Timetable Management (weekly schedule per class)
- Announcements (school-wide or role-targeted)
- PDF Reports (attendance and grade reports)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (green/white school theme)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **PDF Generation**: @react-pdf/renderer
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gbps-school-management
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Run the SQL migrations from `supabase/migrations/` in the SQL Editor
   - This creates all tables, RLS policies, and seed data

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Demo Accounts

After running the seed data:

| Role | Email | Password |
|------|-------|----------|
| Headmaster | headmaster@gbps-d1.edu | headmaster123 |
| Teacher | teacher1@gbps-d1.edu | teacher123 |
| Parent | parent1@gbps-d1.edu | parent123 |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # Reusable UI components (Button, Input, Modal, etc.)
├── context/            # React contexts (Auth, Toast)
├── features/           # Feature modules
│   ├── announcements/  # Announcement management
│   ├── attendance/     # Attendance tracking
│   ├── auth/           # Authentication
│   ├── dashboard/      # Role-specific dashboards
│   ├── grades/         # Grade management
│   ├── homework/       # Homework assignments
│   ├── reports/        # PDF report generation
│   ├── students/       # Student management
│   └── timetable/      # Timetable management
├── hooks/              # Custom React hooks
├── lib/                # Utilities (supabase client, types, helpers)
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Manual Build

```bash
npm run build
```

The `dist/` folder contains the production build.

## Security

- Row-Level Security (RLS) policies enforce data access at the database level
- Role-based access control (RBAC) for all routes and features
- Supabase Auth handles authentication securely
- No sensitive data stored in frontend code

## License

Private - GBPS D-1 Area School
