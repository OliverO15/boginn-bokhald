import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ yearId: string }>
}

export default async function YearProgramsPage({ params }: PageProps) {
  const { yearId } = await params

  const year = await prisma.year.findUnique({
    where: { id: yearId },
    include: {
      programs: {
        include: {
          programType: true,
          pricingOptions: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!year) {
    notFound()
  }

  const programTypes = await prisma.programType.findMany({
    orderBy: { name: 'asc' }
  })

  const configuredProgramTypes = new Set(year.programs.map(p => p.programType.id))
  const availableProgramTypes = programTypes.filter(pt => !configuredProgramTypes.has(pt.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs for {year.year}</h1>
          <p className="text-gray-600 mt-2">Configure pricing and settings for each program type</p>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/years/${yearId}/programs/flexible`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Flexible Program
          </Link>
          {availableProgramTypes.length > 0 && (
            <Link
              href={`/years/${yearId}/programs/new`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add Standard Program
            </Link>
          )}
          <Link
            href="/years"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Years
          </Link>
        </div>
      </div>

      {year.programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {year.programs.map((program) => (
            <div key={program.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {program.name || program.programType?.name || 'Custom Program'}
                  </h3>
                  {program.pricingOptions.length > 0 && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Flexible Pricing
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/years/${yearId}/programs/${program.id}/edit-flexible`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/years/${yearId}/programs/${program.id}/instructors`}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Instructors
                  </Link>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Program Type:</span>
                  <span className="font-medium">
                    {program.programType ? (
                      `${program.programType.isMonthly ? 'Monthly' : 'Seasonal'} 
                      ${!program.programType.isMonthly ? ` (${program.programType.sessionHours}h per session)` : ''}`
                    ) : (
                      `${program.isMonthly ? 'Monthly' : 'Seasonal'} 
                      ${!program.isMonthly && program.sessionDuration ? ` (${program.sessionDuration}h per session)` : ''}`
                    )}
                  </span>
                </div>

                {/* Show flexible pricing options if available */}
                {program.pricingOptions.length > 0 ? (
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Pricing Options:</div>
                    {program.pricingOptions.map((option: any) => (
                      <div key={option.id} className="flex justify-between pl-4">
                        <span>{option.name}:</span>
                        <span className="font-medium">{option.price.toLocaleString()} ISK</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback to legacy pricing */
                  <>
                    <div className="flex justify-between">
                      <span>Full Price:</span>
                      <span className="font-medium">{program.fullPrice.toLocaleString()} ISK</span>
                    </div>
                    {program.halfPrice && (
                      <div className="flex justify-between">
                        <span>Half Price:</span>
                        <span className="font-medium">{program.halfPrice.toLocaleString()} ISK</span>
                      </div>
                    )}
                    {program.subscriptionPrice && (
                      <div className="flex justify-between">
                        <span>With Subscription:</span>
                        <span className="font-medium">{program.subscriptionPrice.toLocaleString()} ISK</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between">
                  <span>Venue Split:</span>
                  <span className="font-medium">
                    {program.venueSplitPercentNew || program.venueSplitPercent}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/registrations?programId=${program.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Registrations →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No programs configured for {year.year} yet.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/years/${yearId}/programs/flexible`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Flexible Program
            </Link>
            {availableProgramTypes.length > 0 && (
              <Link
                href={`/years/${yearId}/programs/new`}
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Standard Program
              </Link>
            )}
          </div>
        </div>
      )}

      {availableProgramTypes.length === 0 && year.programs.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            ✓ All program types have been configured for {year.year}
          </p>
        </div>
      )}
    </div>
  )
}