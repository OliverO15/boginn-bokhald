import Link from 'next/link'

interface MonthSummaryProps {
  year: number
  month: number
  totals: {
    revenue: number
    venueCosts: number
    netProfit: number
    margin: number
  }
  instructorWages?: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthSummary({ 
  year, 
  month, 
  totals, 
  instructorWages = 0
}: MonthSummaryProps) {
  const monthName = MONTH_NAMES[month - 1]
  
  // Calculate final profit including instructor wages
  const totalCosts = totals.venueCosts + instructorWages
  const finalNetProfit = totals.revenue - totalCosts
  const finalMargin = totals.revenue > 0 ? (finalNetProfit / totals.revenue) * 100 : 0
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 {monthName.toUpperCase()} {year} TOTALS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totals.revenue.toLocaleString()} ISK
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totals.venueCosts.toLocaleString()} ISK
            </div>
            <div className="text-sm text-gray-600">Venue Costs</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {instructorWages.toLocaleString()} ISK
            </div>
            <div className="text-sm text-gray-600">Instructor Wages</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              finalNetProfit > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {finalNetProfit.toLocaleString()} ISK
            </div>
            <div className="text-sm text-gray-600">Final Profit</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              finalMargin > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {finalMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Profit Margin</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/reports/${year}/${month}`}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
          >
            📊 Detailed Report
          </Link>
          <Link
            href={`/reports/comparison?year=${year}&month=${month}`}
            className="bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200 transition-colors text-sm"
          >
            📈 Year Comparison
          </Link>
          <Link
            href="/years"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            ⚙️ Manage Programs
          </Link>
        </div>
      </div>
    </div>
  )
}