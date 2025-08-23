import { prisma } from '../src/lib/prisma'
import fs from 'fs'

async function backupAndValidate() {
  console.log('🔄 Starting backup and validation process...\n')
  
  try {
    // 1. Get current data snapshot
    console.log('📊 Collecting current data...')
    
    const years = await prisma.year.findMany({
      include: {
        programs: {
          include: {
            programType: true,
            registrations: true
          }
        },
        seasons: true
      }
    })
    
    const registrations = await prisma.registration.findMany({
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        season: true
      }
    })
    
    const programTypes = await prisma.programType.findMany()
    const instructors = await prisma.instructor.findMany()
    
    // 2. Create backup data structure
    const backupData = {
      timestamp: new Date().toISOString(),
      years: years.length,
      programs: years.reduce((total, year) => total + year.programs.length, 0),
      registrations: registrations.length,
      programTypes: programTypes.length,
      instructors: instructors.length,
      
      // Detailed data for validation
      data: {
        years,
        registrations,
        programTypes,
        instructors
      }
    }
    
    // 3. Save backup to file
    const backupFilename = `backup_${Date.now()}.json`
    fs.writeFileSync(backupFilename, JSON.stringify(backupData, null, 2))
    
    // 4. Display current state
    console.log('✅ Data Summary:')
    console.log(`   Years: ${backupData.years}`)
    console.log(`   Programs: ${backupData.programs}`)
    console.log(`   Registrations: ${backupData.registrations}`)
    console.log(`   Program Types: ${backupData.programTypes}`)
    console.log(`   Instructors: ${backupData.instructors}\n`)
    
    // 5. Validate data integrity
    console.log('🔍 Validating data integrity...')
    
    let validationErrors = 0
    
    // Check for orphaned registrations
    for (const registration of registrations) {
      if (!registration.program) {
        console.log(`❌ Orphaned registration: ${registration.id}`)
        validationErrors++
      }
    }
    
    // Check program types are used
    for (const programType of programTypes) {
      const programsUsingType = years.flatMap(y => y.programs).filter(p => p.programTypeId === programType.id)
      if (programsUsingType.length === 0) {
        console.log(`⚠️  Unused program type: ${programType.name}`)
      }
    }
    
    // 6. Calculate sample financial data for verification
    console.log('💰 Sample Financial Calculations (for migration verification):')
    
    const sampleCalculations = []
    for (const registration of registrations.slice(0, 3)) { // Just first 3 for validation
      const revenue = 
        registration.fullRegistrations * registration.program.fullPrice +
        registration.halfRegistrations * (registration.program.halfPrice || 0) +
        registration.subscriptionRegistrations * (registration.program.subscriptionPrice || 0)
      
      const venueCosts = Math.round(revenue * (registration.program.venueSplitPercent / 100))
      const netProfit = revenue - venueCosts
      
      const calculation = {
        registrationId: registration.id,
        programName: registration.program.programType.name,
        fullReg: registration.fullRegistrations,
        halfReg: registration.halfRegistrations,
        subReg: registration.subscriptionRegistrations,
        revenue,
        venueCosts,
        netProfit
      }
      
      sampleCalculations.push(calculation)
      
      console.log(`   ${calculation.programName}:`)
      console.log(`     Full: ${calculation.fullReg}, Half: ${calculation.halfReg}, Sub: ${calculation.subReg}`)
      console.log(`     Revenue: ${calculation.revenue.toLocaleString()}, Net: ${calculation.netProfit.toLocaleString()} ISK`)
    }
    
    // 7. Save validation data
    fs.writeFileSync(`validation_${Date.now()}.json`, JSON.stringify(sampleCalculations, null, 2))
    
    console.log(`\n✅ Backup created: ${backupFilename}`)
    console.log(`✅ Validation completed with ${validationErrors} errors`)
    console.log('📝 Sample calculations saved for post-migration verification\n')
    
    return {
      success: true,
      backupFile: backupFilename,
      validationErrors,
      sampleCalculations
    }
    
  } catch (error) {
    console.error('❌ Backup and validation failed:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

backupAndValidate().catch(console.error)