import { prisma } from '../src/lib/prisma'

async function checkNewTables() {
  try {
    // Check pricing_options table structure
    const pricingOptionsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pricing_options' 
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('📋 pricing_options table columns:')
    pricingOptionsColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`)
    })
    
    // Check registration_entries table structure
    const registrationEntriesColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registration_entries' 
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('\n📋 registration_entries table columns:')
    registrationEntriesColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNewTables().catch(console.error)