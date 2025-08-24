import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(url.searchParams.get('month') || (new Date().getMonth() + 1).toString())

    console.log(`API Debug - Querying for year: ${year}, month: ${month}`)

    // EXACT same query as dashboard
    const yearData = await prisma.year.findFirst({
      where: { year: year },
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
            }
          }
        },
        seasons: {
          where: {
            AND: [
              { startDate: { lte: new Date(year, month - 1, 31) } },
              { endDate: { gte: new Date(year, month - 1, 1) } }
            ]
          }
        }
      }
    })

    if (!yearData) {
      return NextResponse.json({ error: 'No year found' }, { status: 404 })
    }

    const currentSeason = yearData.seasons[0]

    // Test each program's calculation
    const programDebug = yearData.programs.map(program => {
      const isMonthly = program.isMonthly || false
      const currentRegistration = isMonthly 
        ? program.registrations.find(r => r.month === month)
        : program.registrations.find(r => r.seasonId === currentSeason?.id)

      const currentQuantities = new Map()
      if (currentRegistration) {
        currentRegistration.entries.forEach(entry => {
          currentQuantities.set(entry.pricingOption.id, entry.quantity)
        })
      }

      let totalRevenue = 0
      let totalVenueCosts = 0

      program.pricingOptions.forEach(option => {
        const quantity = currentQuantities.get(option.id) || 0
        if (quantity > 0) {
          const revenue = quantity * option.price
          const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
          totalRevenue += revenue
          totalVenueCosts += venueCost
        }
      })

      return {
        programId: program.id,
        programName: program.name,
        isMonthly,
        registrationsCount: program.registrations.length,
        currentRegistrationFound: !!currentRegistration,
        currentRegistrationId: currentRegistration?.id,
        entriesCount: currentRegistration?.entries.length || 0,
        pricingOptionsCount: program.pricingOptions.length,
        totalRevenue,
        totalVenueCosts,
        totalProfit: totalRevenue - totalVenueCosts,
        quantities: Object.fromEntries(currentQuantities),
        lookingFor: isMonthly ? `month=${month}` : `seasonId=${currentSeason?.id}`
      }
    })

    return NextResponse.json({
      year: yearData.year,
      currentMonth: month,
      currentSeason: currentSeason ? { id: currentSeason.id, name: currentSeason.name } : null,
      programCount: yearData.programs.length,
      seasonCount: yearData.seasons.length,
      programs: programDebug
    })

  } catch (error) {
    console.error('API Debug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}