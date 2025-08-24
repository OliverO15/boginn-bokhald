import { prisma } from '@/lib/prisma'

export default async function DashboardDebugPage() {
  const now = new Date()
  const currentYear = now.getFullYear()  
  const currentMonth = now.getMonth() + 1

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
            where: { month: currentMonth },
            include: {
              entries: {
                include: {
                  pricingOption: true
                }
              }
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

  const currentSeason = year?.seasons[0]
  const seasonalPrograms = year?.programs.filter(p => !p.isMonthly) || []
  const monthlyPrograms = year?.programs.filter(p => p.isMonthly) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Debug Info</h1>
      
      <div className="space-y-4 bg-gray-100 p-4 rounded-lg font-mono text-sm">
        <div>Current Year: {currentYear}</div>
        <div>Current Month: {currentMonth}</div>
        <div>Year Found: {year ? 'Yes' : 'No'}</div>
        <div>Total Programs: {year?.programs.length || 0}</div>
        <div>Seasonal Programs: {seasonalPrograms.length}</div>
        <div>Monthly Programs: {monthlyPrograms.length}</div>
        <div>Current Season: {currentSeason ? currentSeason.name : 'None'}</div>
        <div>Seasons Count: {year?.seasons.length || 0}</div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Seasonal Programs Details:</h2>
        {seasonalPrograms.map((program: any) => (
          <div key={program.id} className="border p-4 mb-4 rounded">
            <div className="font-bold">{program.name || program.programType?.name}</div>
            <div>Is Monthly: {program.isMonthly ? 'Yes' : 'No'}</div>
            <div>Pricing Options: {program.pricingOptions.length}</div>
            {program.pricingOptions.map((option: any) => (
              <div key={option.id} className="ml-4">
                • {option.name}: {option.price} ISK
              </div>
            ))}
          </div>
        ))}
      </div>

      {currentSeason && seasonalPrograms.length > 0 && (
        <div className="mt-8 p-4 bg-green-100 rounded">
          ✅ Condition met: currentSeason && seasonalPrograms.length &gt; 0
          <br />Season: {currentSeason.name}
          <br />Programs: {seasonalPrograms.length}
        </div>
      )}

      {(!currentSeason || seasonalPrograms.length === 0) && (
        <div className="mt-8 p-4 bg-red-100 rounded">
          ❌ Condition NOT met:
          <br />currentSeason: {currentSeason ? 'exists' : 'missing'}
          <br />seasonalPrograms.length: {seasonalPrograms.length}
        </div>
      )}
    </div>
  )
}