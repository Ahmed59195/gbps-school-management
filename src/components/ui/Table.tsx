import { type ReactNode, type HTMLAttributes, type TdHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Skeleton } from './Skeleton'

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('min-w-full divide-y divide-gray-200', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export function TableHeader({
  className,
  children,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn('bg-white divide-y divide-gray-200', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode
}

export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn('hover:bg-gray-50 transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={cn('px-4 py-3 text-sm text-gray-900', className)}
      {...props}
    >
      {children}
    </td>
  )
}

interface TableLoadingProps {
  columns: number
  rows?: number
}

export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

interface TableEmptyProps {
  columns: number
  message?: string
}

export function TableEmpty({
  columns,
  message = 'No data available',
}: TableEmptyProps) {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns} className="text-center py-8 text-gray-500">
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  )
}
