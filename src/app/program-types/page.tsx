import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function ProgramTypesPage() {
  const programTypes = await prisma.programType.findMany({
    include: {
      programs: {
        include: {
          year: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Types</h1>
          <p className="text-gray-600 mt-2">Manage program type templates and configurations</p>
        </div>
        <Link
          href="/program-types/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Program Type
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programTypes.map((programType) => (
          <div key={programType.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{programType.name}</h3>
              <div className="flex gap-2">
                <Link
                  href={`/program-types/${programType.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">
                  {programType.isMonthly ? 'Monthly' : 'Seasonal'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Session Hours:</span>
                <span className="font-medium">
                  {programType.sessionHours} {programType.sessionHours === 1 ? 'hour' : 'hours'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Usage:</span> Used in {programType.programs.length} program{programType.programs.length !== 1 ? 's' : ''}
                {programType.programs.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs">Years: {[...new Set(programType.programs.map(p => p.year.year))].join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {programTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No program types created yet.</p>
          <Link
            href="/program-types/new"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Program Type
          </Link>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">About Program Types</h4>
        <p className="text-blue-800 text-sm">
          Program types are templates that define the structure and billing method for your programs. 
          You can create seasonal programs (billed per season) or monthly programs (billed monthly).
          Each program type can have different session durations.
        </p>
      </div>
    </div>
  )
}