import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MonthNavigator } from '@/components/MonthNavigator'
import { ProgramCard } from '@/components/ProgramCard'
import { MonthSummary } from '@/components/MonthSummary'
import { calculateInstructorWagesForDashboard } from '@/lib/instructor-calculations'

interface PageProps {
  searchParams?: Promise<{ year?: string; month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  
  // Default to current date if no params provided
  const now = new Date()
  const currentYear = parseInt(params.year || now.getFullYear().toString())
  const currentMonth = parseInt(params.month || (now.getMonth() + 1).toString())

  // Get the current year data
  const year = await prisma.year.findFirst({
    where: { year: currentYear },
    include: {
      programs: {
        include: {
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
          }
        }
      },
      seasons: {
        where: {
          AND: [
            { startDate: { lte: new Date(currentYear, currentMonth - 1, 31) } },
            { endDate: { gte: new Date(currentYear, currentMonth - 1, 1) } }
          ]
        }
      }
    }
  })

  if (!year) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Data for {currentYear}</h1>
          <p className="text-gray-600 mb-6">Create a year and programs to start using the dashboard.</p>
          <Link
            href="/years/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Year {currentYear}
          </Link>
        </div>
      </div>
    )
  }

  // Get current season context
  const currentSeason = year.seasons[0]
  
  // Separate seasonal and monthly programs
  const seasonalPrograms = year.programs.filter(p => !p.isMonthly)
  const monthlyPrograms = year.programs.filter(p => p.isMonthly)

  // Calculate month totals including instructor wages
  const monthTotals = calculateMonthlyTotals(year.programs, currentMonth, currentSeason)
  const instructorWages = calculateInstructorWagesForDashboard(year.programs, currentMonth, currentYear, currentSeason)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Month Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">🏹 Boginn Bókhald</h1>
            <div className="flex gap-4">
              <Link
                href="/years"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ⚙️ Manage Programs
              </Link>
            </div>
          </div>
          
          <MonthNavigator 
            currentYear={currentYear}
            currentMonth={currentMonth}
            currentSeason={currentSeason}
          />
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Seasonal Programs */}
        {currentSeason && seasonalPrograms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              🌸 {currentSeason.name.toUpperCase()} PROGRAMS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seasonalPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  currentMonth={currentMonth}
                  currentSeason={currentSeason}
                  isMonthly={false}
                />
              ))}
            </div>
          </div>
        )}


        {/* Monthly Programs */}
        {monthlyPrograms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              📅 MONTHLY PROGRAMS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  currentMonth={currentMonth}
                  isMonthly={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Programs State */}
        {year.programs.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Programs Set Up</h2>
            <p className="text-gray-600 mb-6">Create your first program to start tracking registrations.</p>
            <Link
              href={`/years/${year.id}/programs/flexible`}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Program
            </Link>
          </div>
        )}

        {/* Month Summary */}
        <MonthSummary
          year={currentYear}
          month={currentMonth}
          totals={monthTotals}
          instructorWages={instructorWages}
        />
      </div>
    </div>
  )
}

// Helper function to calculate monthly totals
function calculateMonthlyTotals(programs: any[], month: number, currentSeason?: any) {
  let totalRevenue = 0
  let totalVenueCosts = 0

  for (const program of programs) {
    // For monthly programs, find registrations for the specific month
    if (program.isMonthly) {
      const monthlyRegistration = program.registrations.find((r: any) => r.month === month)
      
      if (monthlyRegistration) {
        // Calculate from flexible pricing entries
        for (const entry of monthlyRegistration.entries) {
          const revenue = entry.quantity * entry.pricingOption.price
          const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
          
          totalRevenue += revenue
          totalVenueCosts += venueCost
        }
      }
    } else {
      // For seasonal programs in monthly view, include registrations from the current season divided by 4
      const seasonalRegistrations = program.registrations.filter((r: any) => 
        r.seasonId === currentSeason?.id && r.month === null
      )
      
      for (const registration of seasonalRegistrations) {
        for (const entry of registration.entries) {
          const revenue = entry.quantity * entry.pricingOption.price
          const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
          
          // Divide by 4 for consistent monthly view
          totalRevenue += revenue / 4
          totalVenueCosts += venueCost / 4
        }
      }
    }
  }

  return {
    revenue: totalRevenue,
    venueCosts: totalVenueCosts,
    netProfit: totalRevenue - totalVenueCosts,
    margin: totalRevenue > 0 ? ((totalRevenue - totalVenueCosts) / totalRevenue) * 100 : 0
  }
}