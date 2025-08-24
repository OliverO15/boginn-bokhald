import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { InstructorAssignmentSection } from '@/components/InstructorAssignmentSection'

interface PageProps {
  params: Promise<{ yearId: string; programId: string }>
}

export default async function ProgramDetailsPage({ params }: PageProps) {
  const { yearId, programId } = await params

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      year: true,
      programType: true,
      pricingOptions: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      registrations: {
        include: {
          entries: {
            include: {
              pricingOption: true
            }
          }
        }
      },
      instructors: {
        include: {
          instructor: true
        }
      },
      seasons: true
    }
  })

  if (!program || program.yearId !== yearId) {
    notFound()
  }

  // Get all available instructors
  const allInstructors = await prisma.instructor.findMany({
    orderBy: { name: 'asc' }
  })

  // Get current season for seasonal programs
  const currentSeason = program.seasons.length > 0 ? program.seasons[0] : null

  // Calculate basic stats
  const totalRegistrations = program.registrations.reduce((sum, reg) => {
    return sum + reg.entries.reduce((entrySum, entry) => entrySum + entry.quantity, 0)
  }, 0)

  const totalRevenue = program.registrations.reduce((sum, reg) => {
    return sum + reg.entries.reduce((entrySum, entry) => {
      return entrySum + (entry.quantity * entry.pricingOption.price)
    }, 0)
  }, 0)

  const displayName = program.name || program.programType?.name || 'Custom Program'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/years/${yearId}/programs`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Programs
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-600 mt-1">
                {program.year.year} • {program.isMonthly ? 'Monthly Program' : 'Seasonal Program'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Overview */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Program Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Type:</span> {program.programType?.name || 'Custom'}</div>
                    <div><span className="text-gray-600">Schedule:</span> {program.isMonthly ? 'Monthly' : 'Seasonal'}</div>
                    <div><span className="text-gray-600">Session Duration:</span> {program.sessionDuration || program.programType?.sessionHours || 'N/A'} hours</div>
                    <div><span className="text-gray-600">Venue Split:</span> {program.venueSplitPercentNew || program.venueSplitPercent}%</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Total Registrations:</span> {totalRegistrations}</div>
                    <div><span className="text-gray-600">Revenue:</span> {totalRevenue.toLocaleString()} ISK</div>
                    <div><span className="text-gray-600">Active Pricing Options:</span> {program.pricingOptions.length}</div>
                    <div><span className="text-gray-600">Assigned Instructors:</span> {program.instructors.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Pricing Options</h2>
              <div className="space-y-3">
                {program.pricingOptions.map((option) => (
                  <div key={option.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-green-600 font-semibold">{option.price.toLocaleString()} ISK</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Assignments */}
            <InstructorAssignmentSection 
              program={program}
              availableInstructors={allInstructors}
              currentSeason={currentSeason}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/years/${yearId}/programs/${programId}/edit-flexible`}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  ✏️ Edit Program
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  📊 View Dashboard
                </Link>
              </div>
            </div>

            {/* Program ID */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Technical Info</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Program ID: {program.id}</div>
                <div>Year ID: {program.yearId}</div>
                {currentSeason && <div>Season ID: {currentSeason.id}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}