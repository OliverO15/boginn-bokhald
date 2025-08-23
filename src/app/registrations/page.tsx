import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { calculateRevenue, calculateVenueCosts } from '@/lib/calculations'

export default async function RegistrationsPage() {
  const registrations = await prisma.registration.findMany({
    include: {
      program: {
        include: {
          programType: true,
          year: true
        }
      },
      season: true
    },
    orderBy: [
      { program: { year: { year: 'desc' } } },
      { program: { programType: { name: 'asc' } } }
    ]
  })

  const years = await prisma.year.findMany({
    include: {
      programs: {
        include: {
          programType: true
        }
      }
    },
    orderBy: { year: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-600 mt-2">Track student enrollments and calculate revenue</p>
        </div>
        <Link
          href="/registrations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Registration
        </Link>
      </div>

      {years.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No years or programs configured yet.</p>
          <Link
            href="/years/new"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create a Year First
          </Link>
        </div>
      ) : (
        <>
          {registrations.length > 0 ? (
            <div className="space-y-6">
              {years.map((year) => {
                const yearRegistrations = registrations.filter(r => r.program.yearId === year.id)
                if (yearRegistrations.length === 0) return null

                return (
                  <div key={year.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{year.year}</h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {yearRegistrations.map((registration) => {
                          const revenue = calculateRevenue(
                            {
                              fullRegistrations: registration.fullRegistrations,
                              halfRegistrations: registration.halfRegistrations,
                              subscriptionRegistrations: registration.subscriptionRegistrations
                            },
                            {
                              fullPrice: registration.program.fullPrice,
                              halfPrice: registration.program.halfPrice,
                              subscriptionPrice: registration.program.subscriptionPrice,
                              venueSplitPercent: registration.program.venueSplitPercent
                            }
                          )
                          
                          const venueCosts = calculateVenueCosts(revenue, registration.program.venueSplitPercent)

                          return (
                            <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-medium text-gray-900">{registration.program.programType.name}</h3>
                                <Link
                                  href={`/registrations/${registration.id}/edit`}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Edit
                                </Link>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Period:</span>
                                  <span className="font-medium">
                                    {registration.season ? registration.season.name : `Month ${registration.month}`}
                                  </span>
                                </div>
                                
                                {registration.fullRegistrations > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Full:</span>
                                    <span>{registration.fullRegistrations}</span>
                                  </div>
                                )}
                                
                                {registration.halfRegistrations > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Half:</span>
                                    <span>{registration.halfRegistrations}</span>
                                  </div>
                                )}
                                
                                {registration.subscriptionRegistrations > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Subscription:</span>
                                    <span>{registration.subscriptionRegistrations}</span>
                                  </div>
                                )}

                                <div className="border-t border-gray-100 pt-2 mt-2">
                                  <div className="flex justify-between font-medium">
                                    <span className="text-gray-900">Revenue:</span>
                                    <span className="text-green-600">{revenue.toLocaleString()} ISK</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Venue Cost:</span>
                                    <span>{venueCosts.toLocaleString()} ISK</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Net:</span>
                                    <span>{(revenue - venueCosts).toLocaleString()} ISK</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No registrations recorded yet.</p>
              <Link
                href="/registrations/new"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Registration
              </Link>
            </div>
          )}

          {years.some(year => year.programs.length > 0) && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">Quick Registration Guide</h4>
              <p className="text-blue-800 text-sm">
                Add registrations for each program and period. The system will automatically calculate revenue, 
                venue costs, and net profit based on your program pricing configuration.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}