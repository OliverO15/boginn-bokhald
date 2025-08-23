import { prisma } from '../src/lib/prisma'

async function fixConstraints() {
  console.log('🔧 Fixing database constraints...\n')
  
  try {
    // Make programTypeId nullable
    console.log('Making programTypeId nullable...')
    await prisma.$executeRaw`
      ALTER TABLE programs 
      ALTER COLUMN "programTypeId" DROP NOT NULL
    `
    console.log('✅ programTypeId is now nullable')
    
    // Test creating program without programTypeId
    console.log('\nTesting program creation without programTypeId...')
    
    const yearId = (await prisma.year.findFirst())?.id
    if (!yearId) {
      throw new Error('No year found')
    }
    
    const testProgram = await prisma.program.create({
      data: {
        yearId,
        name: 'Test Flexible Program',
        sessionDuration: 2.0,
        isMonthly: false,
        venueSplitPercentNew: 45,
        fullPrice: 60000,
        venueSplitPercent: 45
      }
    })
    
    console.log('✅ Successfully created program without programTypeId:', testProgram.name)
    console.log(`   ID: ${testProgram.id}`)
    console.log(`   Name: ${testProgram.name}`)
    console.log(`   Session Duration: ${testProgram.sessionDuration}h`)
    console.log(`   Venue Split: ${testProgram.venueSplitPercentNew}%`)
    
    // Clean up test program
    await prisma.program.delete({ where: { id: testProgram.id } })
    console.log('✅ Test program cleaned up')
    
    console.log('\n🎉 Database constraints fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing constraints:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixConstraints().catch(console.error)