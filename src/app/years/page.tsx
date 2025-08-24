import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function YearsPage() {
  const years = await prisma.year.findMany({
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
    },
    orderBy: { year: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Years & Programs</h1>
          <p className="text-gray-600 mt-2">Manage years and configure program pricing</p>
        </div>
        <Link
          href="/years/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Year
        </Link>
      </div>

      <div className="space-y-6">
        {years.map((year) => (
          <div key={year.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">{year.year}</h2>
                <Link
                  href={`/years/${year.id}/programs`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Manage Programs
                </Link>
              </div>

              {year.programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {year.programs.map((program: any) => (
                    <div key={program.id} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {program.name || program.programType?.name || 'Custom Program'}
                        </h3>
                        {program.pricingOptions.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Flexible
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {/* Show flexible pricing options if available */}
                        {program.pricingOptions.length > 0 ? (
                          <div className="space-y-1">
                            {program.pricingOptions.slice(0, 2).map((option: any) => (
                              <p key={option.id}>
                                {option.name}: {option.price.toLocaleString()} ISK
                              </p>
                            ))}
                            {program.pricingOptions.length > 2 && (
                              <p className="text-gray-500 italic">
                                +{program.pricingOptions.length - 2} more options
                              </p>
                            )}
                          </div>
                        ) : (
                          /* Fallback to legacy pricing */
                          <>
                            <p>Full Price: {program.fullPrice.toLocaleString()} ISK</p>
                            {program.halfPrice && (
                              <p>Half Price: {program.halfPrice.toLocaleString()} ISK</p>
                            )}
                            {program.subscriptionPrice && (
                              <p>With Subscription: {program.subscriptionPrice.toLocaleString()} ISK</p>
                            )}
                          </>
                        )}
                        <p className="mt-1 text-gray-500">
                          Venue Split: {program.venueSplitPercentNew || program.venueSplitPercent}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No programs configured for this year yet.</p>
              )}
            </div>
          </div>
        ))}

        {years.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No years created yet.</p>
            <Link
              href="/years/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Year
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}