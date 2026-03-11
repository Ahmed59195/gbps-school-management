import type { TimetableEntryWithDetails } from '../../lib/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = [
  { period: 1, start: '08:00', end: '08:45' },
  { period: 2, start: '08:45', end: '09:30' },
  { period: 3, start: '09:30', end: '10:15' },
  { period: 4, start: '10:30', end: '11:15' }, // After break
  { period: 5, start: '11:15', end: '12:00' },
  { period: 6, start: '12:00', end: '12:45' },
  { period: 7, start: '14:00', end: '14:45' }, // After lunch
  { period: 8, start: '14:45', end: '15:30' },
]

interface TimetableGridProps {
  entries: TimetableEntryWithDetails[]
  className?: string
}

export function TimetableGrid({ entries, className = '' }: TimetableGridProps) {
  const getEntry = (dayIndex: number, startTime: string) => {
    return entries.find(
      (e) => e.day_of_week === dayIndex && e.start_time === startTime
    )
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-24">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period, periodIndex) => (
            <tr
              key={period.period}
              className={periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="border border-gray-200 p-2 text-xs text-gray-600 whitespace-nowrap">
                <div className="font-medium">Period {period.period}</div>
                <div>
                  {formatTime(period.start)} - {formatTime(period.end)}
                </div>
              </td>
              {DAYS.map((_, dayIndex) => {
                const entry = getEntry(dayIndex, period.start)
                return (
                  <td
                    key={dayIndex}
                    className="border border-gray-200 p-2 text-center min-w-[120px]"
                  >
                    {entry ? (
                      <div className="bg-primary-50 rounded p-2">
                        <div className="font-medium text-primary-900 text-sm">
                          {entry.subject?.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {entry.teacher?.full_name}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-300 text-sm">-</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Export constants for use in edit page
export { DAYS, PERIODS }
