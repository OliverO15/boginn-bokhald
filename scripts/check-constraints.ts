import { prisma } from '../src/lib/prisma'

async function checkConstraints() {
  try {
    // Check programs table constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        column_name, 
        is_nullable, 
        column_default,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'programs' 
      AND column_name IN ('program_type_id', 'programTypeId')
      ORDER BY column_name
    ` as any[]
    
    console.log('Programs table programTypeId constraints:')
    constraints.forEach(constraint => {
      console.log(`   ${constraint.column_name}: ${constraint.data_type} ${constraint.is_nullable} ${constraint.column_default || '(no default)'}`)
    })
    
    // Try to create a program without programTypeId to test constraint
    console.log('\nTesting program creation without programTypeId...')
    
    try {
      const testProgram = await prisma.program.create({
        data: {
          yearId: (await prisma.year.findFirst())?.id || 'test',
          name: 'Test Program',
          sessionDuration: 1.5,
          isMonthly: false,
          venueSplitPercentNew: 50,
          fullPrice: 50000,
          venueSplitPercent: 50
        }
      })
      console.log('✅ Successfully created program without programTypeId:', testProgram.id)
      
      // Clean up
      await prisma.program.delete({ where: { id: testProgram.id } })
      console.log('✅ Test program cleaned up')
      
    } catch (error: any) {
      console.log('❌ Failed to create program without programTypeId:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkConstraints().catch(console.error)