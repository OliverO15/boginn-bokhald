import { prisma } from '../src/lib/prisma'

async function debugDashboard() {
  console.log('🔍 Debugging dashboard data...\n')
  
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    console.log(`Looking for year: ${currentYear}, month: ${currentMonth}`)

    // Get the current year data (same query as dashboard)
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

    if (!year) {
      console.log(`❌ No year found for ${currentYear}`)
      
      // Check what years exist
      const allYears = await prisma.year.findMany()
      console.log('Available years:', allYears.map(y => y.year))
      return
    }

    console.log(`✅ Found year ${year.year}`)
    console.log(`Programs count: ${year.programs.length}`)
    console.log(`Seasons count: ${year.seasons.length}`)

    // Debug each program
    for (const program of year.programs) {
      console.log(`\n📋 Program: ${program.name || program.programType?.name || 'Custom'}`)
      console.log(`  - ID: ${program.id}`)
      console.log(`  - Is Monthly: ${program.isMonthly}`)
      console.log(`  - Pricing Options: ${program.pricingOptions.length}`)
      
      program.pricingOptions.forEach((option: any, index: number) => {
        console.log(`    ${index + 1}. ${option.name} - ${option.price} ISK`)
      })
      
      console.log(`  - Registrations for month ${currentMonth}: ${program.registrations.length}`)
      
      program.registrations.forEach((reg: any) => {
        console.log(`    Registration ID: ${reg.id}, Entries: ${reg.entries.length}`)
      })
    }

    // Debug seasons
    for (const season of year.seasons) {
      console.log(`\n🌸 Season: ${season.name}`)
      console.log(`  - Start: ${season.startDate}`)
      console.log(`  - End: ${season.endDate}`)
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDashboard().catch(console.error)