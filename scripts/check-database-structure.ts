import { prisma } from '../src/lib/prisma'

async function checkDatabaseStructure() {
  console.log('🔍 Checking actual database structure...\n')
  
  try {
    // Check programs table structure
    const programColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'programs' 
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('📋 Programs table columns:')
    programColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
    })
    
    // Check new tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('pricing_options', 'registration_entries', 'program_templates', 'pricing_templates')
    ` as any[]
    
    console.log('\n📋 New tables created:')
    tables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`)
    })
    
    // Check data in new tables
    const pricingOptionsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM pricing_options` as any[]
    const registrationEntriesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM registration_entries` as any[]
    
    console.log('\n📊 Data in new tables:')
    console.log(`   pricing_options: ${pricingOptionsCount[0].count} rows`)
    console.log(`   registration_entries: ${registrationEntriesCount[0].count} rows`)
    
    // Show some sample data
    const samplePricingOptions = await prisma.$queryRaw`
      SELECT po.name, po.price, p.id as program_id 
      FROM pricing_options po 
      JOIN programs p ON po.program_id = p.id 
      LIMIT 5
    ` as any[]
    
    console.log('\n📋 Sample pricing options:')
    samplePricingOptions.forEach(option => {
      console.log(`   ${option.name}: ${option.price} ISK (program: ${option.program_id})`)
    })
    
    return { success: true, programColumns, tables }
    
  } catch (error) {
    console.error('❌ Database structure check failed:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseStructure().catch(console.error)