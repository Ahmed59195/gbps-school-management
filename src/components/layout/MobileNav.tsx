import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
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
import { Button } from '../ui/Button'
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

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { profile } = useAuth()

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!profile) return null

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transform transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                GBPS D-1 Area
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  'min-h-[48px]',
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
      </div>
    </>
  )
}
