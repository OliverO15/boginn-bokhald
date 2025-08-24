import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { calculateRevenue, calculateVenueCosts } from '@/lib/calculations'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  // Get current year and month for default view
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Get years for navigation
  const years = await prisma.year.findMany({
    include: {
      programs: {
        include: {
          programType: true,
          registrations: {
            include: {
              entries: {
                include: {
                  pricingOption: true
                }
              }
            }
          },
          pricingOptions: true
        }
      },
      seasons: true
    },
    orderBy: { year: 'desc' }
  })

  // Get venue payments for all years
  const venuePayments = await prisma.venuePayment.findMany({
    include: {
      year: true,
      season: true
    },
    orderBy: [
      { year: { year: 'desc' } },
      { month: 'asc' }
    ]
  })

  // Calculate monthly revenue totals
  const monthlyRevenue = new Map<string, number>()
  const monthlyVenueCosts = new Map<string, number>()
  const seasonalRevenue = new Map<string, number>()
  const seasonalVenueCosts = new Map<string, number>()

  for (const year of years) {
    for (const program of year.programs) {
      for (const registration of program.registrations) {
        let revenue = 0
        for (const entry of registration.entries) {
          revenue += entry.quantity * entry.pricingOption.price
        }
        
        const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
        
        if (program.isMonthly && registration.month) {
          const key = `${year.year}-${registration.month}`
          monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + revenue)
          monthlyVenueCosts.set(key, (monthlyVenueCosts.get(key) || 0) + venueCost)
        } else if (!program.isMonthly && registration.seasonId) {
          const season = year.seasons.find(s => s.id === registration.seasonId)
          if (season) {
            const key = `${year.year}-${season.name}`
            seasonalRevenue.set(key, (seasonalRevenue.get(key) || 0) + revenue)
            seasonalVenueCosts.set(key, (seasonalVenueCosts.get(key) || 0) + venueCost)
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Reports</h1>
              <p className="text-gray-600 mt-1">Revenue tracking, venue costs, and instructor hours</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/reports/venue-payments"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                💰 Manage Venue Payments
              </Link>
              <Link
                href="/reports/instructor-hours"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                👨‍🏫 Instructor Hours
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 This Month Revenue</h3>
            <div className="text-2xl font-bold text-green-600">
              {(monthlyRevenue.get(`${currentYear}-${currentMonth}`) || 0).toLocaleString()} ISK
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏢 Expected Venue Cost</h3>
            <div className="text-2xl font-bold text-orange-600">
              {(monthlyVenueCosts.get(`${currentYear}-${currentMonth}`) || 0).toLocaleString()} ISK
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💸 Venue Payments Made</h3>
            <div className="text-2xl font-bold text-red-600">
              {venuePayments
                .filter(p => p.year.year === currentYear && p.month === currentMonth)
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()} ISK
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Net Revenue</h3>
            <div className="text-2xl font-bold text-blue-600">
              {((monthlyRevenue.get(`${currentYear}-${currentMonth}`) || 0) - 
                (monthlyVenueCosts.get(`${currentYear}-${currentMonth}`) || 0)).toLocaleString()} ISK
            </div>
          </div>
        </div>

        {/* Monthly Revenue Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📅 Monthly Revenue Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Venue Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Payments</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from(monthlyRevenue.entries())
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 12) // Show last 12 months
                    .map(([key, revenue]) => {
                      const [year, month] = key.split('-')
                      const expectedVenueCost = monthlyVenueCosts.get(key) || 0
                      const actualPayments = venuePayments
                        .filter(p => p.year.year === parseInt(year) && p.month === parseInt(month))
                        .reduce((sum, p) => sum + p.amount, 0)
                      const difference = expectedVenueCost - actualPayments
                      
                      return (
                        <tr key={key}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {revenue.toLocaleString()} ISK
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expectedVenueCost.toLocaleString()} ISK
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {actualPayments.toLocaleString()} ISK
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                            difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString()} ISK
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seasonal Programs Summary */}
        {seasonalRevenue.size > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">🌸 Seasonal Programs</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(seasonalRevenue.entries()).map(([key, revenue]) => {
                  const venueCost = seasonalVenueCosts.get(key) || 0
                  const netRevenue = revenue - venueCost
                  
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{key}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">{revenue.toLocaleString()} ISK</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venue Cost:</span>
                          <span className="font-medium">{venueCost.toLocaleString()} ISK</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-gray-600">Net:</span>
                          <span className="font-medium text-green-600">{netRevenue.toLocaleString()} ISK</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}