import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import VenuePaymentForm from '@/components/VenuePaymentForm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function VenuePaymentsPage() {
  // Get all years with seasons
  const years = await prisma.year.findMany({
    include: {
      seasons: true,
      venuePayments: {
        include: {
          season: true
        },
        orderBy: [
          { month: 'asc' },
          { createdAt: 'desc' }
        ]
      }
    },
    orderBy: { year: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💰 Venue Payments</h1>
              <p className="text-gray-600 mt-1">Track manual venue payments made each month</p>
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
        {/* Add New Payment Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">➕ Record New Venue Payment</h2>
          </div>
          <div className="p-6">
            <VenuePaymentForm years={years} />
          </div>
        </div>

        {/* Payment History */}
        <div className="space-y-6">
          {years.map((year) => {
            if (year.venuePayments.length === 0) return null
            
            return (
              <div key={year.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{year.year} Venue Payments</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Paid</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {year.venuePayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.paidDate.toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.season ? payment.season.name : 
                               payment.month ? new Date(year.year, payment.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                               'Unknown'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.amount.toLocaleString()} ISK
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {payment.description || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                className="text-red-600 hover:text-red-800 text-sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this payment record?')) {
                                    // TODO: Implement delete functionality
                                    window.location.reload()
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total {year.year} Venue Payments:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {year.venuePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ISK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Show message if no payments exist */}
        {years.every(year => year.venuePayments.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Venue Payments Recorded</h2>
            <p className="text-gray-600">Start by recording your first venue payment above.</p>
          </div>
        )}
      </div>
    </div>
  )
}