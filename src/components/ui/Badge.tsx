import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'

type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  outline: 'bg-transparent border border-gray-300 text-gray-700',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
}

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Convenience components for common status badges
export function PresentBadge() {
  return <Badge variant="success">Present</Badge>
}

export function AbsentBadge() {
  return <Badge variant="danger">Absent</Badge>
}

export function LateBadge() {
  return <Badge variant="warning">Late</Badge>
}

export function AttendanceBadge({
  status,
}: {
  status: 'present' | 'absent' | 'late'
}) {
  switch (status) {
    case 'present':
      return <PresentBadge />
    case 'absent':
      return <AbsentBadge />
    case 'late':
      return <LateBadge />
    default:
      return <Badge>{status}</Badge>
  }
}

export function RoleBadge({ role }: { role: 'headmaster' | 'teacher' | 'parent' }) {
  const variants: Record<string, BadgeVariant> = {
    headmaster: 'primary',
    teacher: 'info',
    parent: 'secondary',
  }
  const labels: Record<string, string> = {
    headmaster: 'Headmaster',
    teacher: 'Teacher',
    parent: 'Parent',
  }
  return <Badge variant={variants[role]}>{labels[role]}</Badge>
}
