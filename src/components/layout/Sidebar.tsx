import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  Calendar,
  BookOpen,
  ClipboardList,
  Clock,
  Megaphone,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import type { Role } from '../../lib/types'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Home,
    roles: ['headmaster', 'teacher', 'parent'],
  },
  {
    label: 'Students',
    href: '/students',
    icon: Users,
    roles: ['headmaster'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    roles: ['headmaster', 'teacher', 'parent'],
  },
  {
    label: 'Grades',
    href: '/grades',
    icon: BookOpen,
    roles: ['headmaster', 'teacher', 'parent'],
  },
  {
    label: 'Homework',
    href: '/homework',
    icon: ClipboardList,
    roles: ['headmaster', 'teacher', 'parent'],
  },
  {
    label: 'Timetable',
    href: '/timetable',
    icon: Clock,
    roles: ['headmaster', 'teacher', 'parent'],
  },
  {
    label: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
    roles: ['headmaster'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['headmaster'],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { profile } = useAuth()

  if (!profile) return null

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  )

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto',
        className
      )}
    >
      <nav className="p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'min-h-[44px]',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
