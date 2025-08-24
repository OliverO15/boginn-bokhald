import { prisma } from '../src/lib/prisma'

async function fixSeasons() {
  console.log('🔧 Fixing seasons with proper 3-season split...\n')
  
  try {
    // Delete existing seasons
    await prisma.season.deleteMany()
    console.log('✅ Deleted existing seasons')
    
    // Get 2025 year
    const year2025 = await prisma.year.findFirst({
      where: { year: 2025 }
    })
    
    if (!year2025) {
      console.log('❌ No 2025 year found')
      return
    }
    
    // Create 3 proper seasons for 2025 (Jan-Apr, May-Aug, Sept-Dec)
    const seasons = [
      {
        yearId: year2025.id,
        name: 'Winter/Spring 2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-04-30')
      },
      {
        yearId: year2025.id, 
        name: 'Summer 2025',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-08-31')
      },
      {
        yearId: year2025.id,
        name: 'Fall 2025', 
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-31')
      }
    ]
    
    for (const season of seasons) {
      await prisma.season.create({ data: season })
      console.log(`✅ Created season: ${season.name}`)
    }
    
    console.log('\n🎉 Seasons fixed!')
    console.log('Now have proper 3-season split:')
    console.log('- Winter/Spring: Jan-Apr') 
    console.log('- Summer: May-Aug')
    console.log('- Fall: Sept-Dec')
    
  } catch (error) {
    console.error('❌ Error fixing seasons:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSeasons().catch(console.error)