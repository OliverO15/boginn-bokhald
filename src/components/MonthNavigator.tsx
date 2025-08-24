'use client'

import Link from 'next/link'

interface MonthNavigatorProps {
  currentYear: number
  currentMonth: number
  currentSeason?: {
    name: string
    startDate: Date
    endDate: Date
  } | null
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthNavigator({ currentYear, currentMonth, currentSeason }: MonthNavigatorProps) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear

  const now = new Date()
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-6 py-4">
      {/* Previous Month */}
      <Link
        href={`/dashboard?year=${prevYear}&month=${prevMonth}`}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-lg">←</span>
        <span className="ml-2">{MONTH_NAMES[prevMonth - 1]} {prevYear}</span>
      </Link>

      {/* Current Month Display */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
          📅 {MONTH_NAMES[currentMonth - 1].toUpperCase()} {currentYear}
          {isCurrentMonth && <span className="ml-2 text-green-600">•</span>}
        </h2>
        {currentSeason && (
          <p className="text-gray-600 text-sm mt-1">
            {currentSeason.name}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Today: {now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Next Month */}
      <Link
        href={`/dashboard?year=${nextYear}&month=${nextMonth}`}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="mr-2">{MONTH_NAMES[nextMonth - 1]} {nextYear}</span>
        <span className="text-lg">→</span>
      </Link>

      {/* Quick Jump to Today */}
      {!isCurrentMonth && (
        <Link
          href="/dashboard"
          className="absolute right-4 top-4 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
        >
          Go to Today
        </Link>
      )}
    </div>
  )
}