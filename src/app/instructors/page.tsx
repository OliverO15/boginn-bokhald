import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    include: {
      programAssignments: {
        include: {
          program: {
            include: {
              programType: true,
              year: true
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  const currentYear = new Date().getFullYear()

  // Calculate active assignments for current year
  const instructorsWithStats = instructors.map(instructor => {
    const currentYearAssignments = instructor.programAssignments.filter(
      assignment => assignment.program.year.year === currentYear
    )
    
    const totalWorkDays = currentYearAssignments.reduce((sum, assignment) => {
      return sum + (assignment.workDays as string[]).length
    }, 0)

    return {
      ...instructor,
      currentYearAssignments: currentYearAssignments.length,
      totalWorkDays
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Instructors</h1>
              <p className="text-gray-600 mt-1">
                Manage instructor assignments and wages
              </p>
            </div>
            <Link
              href="/instructors/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Add Instructor
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {instructors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Instructors Yet</h2>
            <p className="text-gray-600 mb-6">
              Add your first instructor to start managing program assignments and wages.
            </p>
            <Link
              href="/instructors/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add First Instructor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {instructorsWithStats.map((instructor) => (
              <div key={instructor.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {instructor.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {instructor.hourlyWage.toLocaleString()} ISK/hour
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/instructors/${instructor.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ Edit
                    </Link>
                  </div>
                </div>

                {/* Current Year Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Active Programs ({currentYear}):</span>
                    <span className="font-semibold">{instructor.currentYearAssignments}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Total Work Days/Week:</span>
                    <span className="font-semibold">{instructor.totalWorkDays}</span>
                  </div>
                </div>

                {/* Program Assignments */}
                {instructor.programAssignments.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Program Assignments</h4>
                    <div className="space-y-2">
                      {instructor.programAssignments.slice(0, 3).map((assignment) => (
                        <div key={assignment.id} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <div className="font-medium">
                            {assignment.program.name || assignment.program.programType?.name}
                          </div>
                          <div className="text-gray-600">
                            {assignment.program.year.year} • {(assignment.workDays as string[]).join(', ')}
                          </div>
                        </div>
                      ))}
                      {instructor.programAssignments.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{instructor.programAssignments.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <Link
                    href={`/instructors/${instructor.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                  <span className="text-xs text-gray-400">
                    ID: {instructor.id.slice(-8)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {instructors.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{instructors.length}</div>
                <div className="text-sm text-gray-600">Total Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {instructorsWithStats.reduce((sum, i) => sum + i.currentYearAssignments, 0)}
                </div>
                <div className="text-sm text-gray-600">Active Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(instructors.reduce((sum, i) => sum + i.hourlyWage, 0) / instructors.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Avg Hourly Rate (ISK)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {instructorsWithStats.reduce((sum, i) => sum + i.totalWorkDays, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Work Days/Week</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}