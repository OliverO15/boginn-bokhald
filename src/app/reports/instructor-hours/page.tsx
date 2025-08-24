import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SearchParams {
  year?: string
  month?: string
}

interface PageProps {
  searchParams?: Promise<SearchParams>
}

export default async function InstructorHoursPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  
  // Default to current year and month
  const currentDate = new Date()
  const selectedYear = parseInt(params.year || currentDate.getFullYear().toString())
  const selectedMonth = parseInt(params.month || (currentDate.getMonth() + 1).toString())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get all years and instructors
  const [years, instructors] = await Promise.all([
    prisma.year.findMany({ orderBy: { year: 'desc' } }),
    prisma.instructor.findMany({
      include: {
        programAssignments: {
          include: {
            program: {
              include: {
                year: true,
                registrations: {
                  include: {
                    entries: {
                      include: {
                        pricingOption: true
                      }
                    }
                  }
                },
                seasons: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  ])

  // Calculate instructor hours for the selected month
  const instructorHours: Array<{
    instructor: any
    programs: Array<{
      programName: string
      programType: 'monthly' | 'seasonal'
      estimatedHours: number
      hourlyRate: number
      estimatedPay: number
      registrations: number
    }>
    totalEstimatedHours: number
    totalEstimatedPay: number
  }> = []

  for (const instructor of instructors) {
    const programs: any[] = []
    let totalEstimatedHours = 0
    let totalEstimatedPay = 0

    for (const assignment of instructor.programAssignments) {
      const program = assignment.program
      
      // Skip if not in selected year
      if (program.year.year !== selectedYear) continue

      let estimatedHours = 0
      let registrations = 0

      if (program.isMonthly) {
        // Monthly program - check for registrations in selected month
        const monthlyRegistration = program.registrations.find(r => r.month === selectedMonth)
        if (monthlyRegistration) {
          registrations = monthlyRegistration.entries.reduce((sum, entry) => sum + entry.quantity, 0)
          
          // Estimate: assume 4 sessions per month, each lasting program.sessionDuration hours
          if (registrations > 0) {
            estimatedHours = 4 * (program.sessionDuration || 1.5)
          }
        }
      } else {
        // Seasonal program - check if selected month falls within any season
        for (const season of program.seasons) {
          const seasonStart = new Date(season.startDate)
          const seasonEnd = new Date(season.endDate)
          const monthStart = new Date(selectedYear, selectedMonth - 1, 1)
          const monthEnd = new Date(selectedYear, selectedMonth, 0)
          
          // Check if month overlaps with season
          if (monthStart <= seasonEnd && monthEnd >= seasonStart) {
            const seasonalRegistration = program.registrations.find(r => r.seasonId === season.id)
            if (seasonalRegistration) {
              registrations = seasonalRegistration.entries.reduce((sum, entry) => sum + entry.quantity, 0)
              
              // Estimate based on season duration and program sessions
              const seasonMonths = Math.ceil((seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24 * 30))
              if (registrations > 0 && seasonMonths > 0) {
                // Assume 4 sessions per month for the season, divided by number of months
                estimatedHours = (4 * (program.sessionDuration || 1.5))
              }
            }
            break
          }
        }
      }

      // Calculate pay
      const estimatedPay = estimatedHours * instructor.hourlyWage

      if (estimatedHours > 0 || registrations > 0) {
        programs.push({
          programName: program.name,
          programType: program.isMonthly ? 'monthly' : 'seasonal',
          estimatedHours,
          hourlyRate: instructor.hourlyWage,
          estimatedPay,
          registrations
        })

        totalEstimatedHours += estimatedHours
        totalEstimatedPay += estimatedPay
      }
    }

    if (programs.length > 0) {
      instructorHours.push({
        instructor,
        programs,
        totalEstimatedHours,
        totalEstimatedPay
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Instructor Hours</h1>
              <p className="text-gray-600 mt-1">Track instructor hours and calculate monthly payroll</p>
            </div>
            <Link
              href="/reports"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Period Display */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Years:</h3>
                  <div className="flex space-x-2">
                    {years.slice(0, 3).map((year) => (
                      <Link
                        key={year.id}
                        href={`/reports/instructor-hours?year=${year.year}&month=${selectedMonth}`}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          year.year === selectedYear 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {year.year}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Months:</h3>
                  <div className="flex space-x-1">
                    {[selectedMonth - 1, selectedMonth, selectedMonth + 1].map((month) => {
                      const adjustedMonth = month > 12 ? month - 12 : month < 1 ? month + 12 : month
                      const adjustedYear = month > 12 ? selectedYear + 1 : month < 1 ? selectedYear - 1 : selectedYear
                      return (
                        <Link
                          key={`${adjustedYear}-${adjustedMonth}`}
                          href={`/reports/instructor-hours?year=${adjustedYear}&month=${adjustedMonth}`}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            adjustedMonth === selectedMonth && adjustedYear === selectedYear
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {monthNames[adjustedMonth - 1]?.substring(0, 3)}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </div>
                <div className="text-sm text-gray-600">
                  {instructorHours.length} active instructors
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⏱️ Total Hours</h3>
            <div className="text-2xl font-bold text-blue-600">
              {instructorHours.reduce((sum, ih) => sum + ih.totalEstimatedHours, 0).toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Total Payroll</h3>
            <div className="text-2xl font-bold text-green-600">
              {instructorHours.reduce((sum, ih) => sum + ih.totalEstimatedPay, 0).toLocaleString()} ISK
            </div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Active Instructors</h3>
            <div className="text-2xl font-bold text-purple-600">
              {instructorHours.length}
            </div>
            <div className="text-sm text-gray-600">With assigned programs</div>
          </div>
        </div>

        {/* Instructor Hours Details */}
        {instructorHours.length > 0 ? (
          <div className="space-y-6">
            {instructorHours.map(({ instructor, programs, totalEstimatedHours, totalEstimatedPay }) => (
              <div key={instructor.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{instructor.name}</h3>
                      <p className="text-gray-600">{instructor.hourlyWage.toLocaleString()} ISK/hour</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {totalEstimatedPay.toLocaleString()} ISK
                      </div>
                      <div className="text-sm text-gray-600">
                        {totalEstimatedHours.toFixed(1)} hours estimated
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Pay</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {programs.map((program, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {program.programName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                program.programType === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {program.programType}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {program.registrations}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {program.estimatedHours.toFixed(1)}h
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {program.estimatedPay.toLocaleString()} ISK
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Instructor Hours</h2>
            <p className="text-gray-600">
              No instructors have programs with registrations for {monthNames[selectedMonth - 1]} {selectedYear}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}