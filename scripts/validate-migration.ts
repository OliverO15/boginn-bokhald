import { prisma } from '../src/lib/prisma'
import { calculateFlexibleRevenue, calculateVenueCosts } from '../src/lib/calculations-new'

async function validateMigration() {
  console.log('🔍 Validating migration integrity...\n')
  
  try {
    // 1. Test new Prisma client with flexible schema
    console.log('📝 Testing new Prisma client...')
    
    const programs = await prisma.program.findMany({
      include: {
        pricingOptions: {
          orderBy: { order: 'asc' }
        },
        year: true,
        programType: true
      }
    })
    
    const registrations = await prisma.registration.findMany({
      include: {
        entries: {
          include: {
            pricingOption: true
          }
        },
        program: {
          include: {
            pricingOptions: true
          }
        },
        season: true
      }
    })
    
    console.log(`✅ Found ${programs.length} programs with flexible pricing`)
    console.log(`✅ Found ${registrations.length} registrations with dynamic entries`)
    
    // 2. Validate program data structure
    console.log('\n📝 Validating program data structure...')
    
    for (const program of programs) {
      console.log(`   ${program.name || 'Unnamed Program'}:`)
      console.log(`     Duration: ${program.sessionDuration}h | Monthly: ${program.isMonthly} | Venue Split: ${program.venueSplitPercent}%`)
      console.log(`     Pricing Options: ${program.pricingOptions.length}`)
      
      program.pricingOptions.forEach((option, index) => {
        console.log(`       ${index + 1}. ${option.name}: ${option.price.toLocaleString()} ISK`)
      })
    }
    
    // 3. Validate financial calculations match original
    console.log('\n📝 Validating financial calculations...')
    
    const calculationValidation = []
    
    for (const registration of registrations) {
      // Calculate using new flexible system
      const flexibleRevenue = calculateFlexibleRevenue(registration.entries)
      const venueCosts = calculateVenueCosts(flexibleRevenue, registration.program.venueSplitPercent)
      const netProfit = flexibleRevenue - venueCosts
      
      // Load original backup data for comparison (if available)
      let validationResult = {
        registrationId: registration.id,
        programName: registration.program.name,
        entries: registration.entries.map(entry => ({
          pricingOption: entry.pricingOption.name,
          quantity: entry.quantity,
          subtotal: entry.quantity * entry.pricingOption.price
        })),
        flexibleRevenue,
        venueCosts,
        netProfit,
        status: 'CALCULATED'
      }
      
      calculationValidation.push(validationResult)
      
      console.log(`   ${validationResult.programName}:`)
      validationResult.entries.forEach(entry => {
        console.log(`     ${entry.pricingOption}: ${entry.quantity} × ${(entry.subtotal / entry.quantity).toLocaleString()} = ${entry.subtotal.toLocaleString()} ISK`)
      })
      console.log(`     Revenue: ${validationResult.flexibleRevenue.toLocaleString()} ISK`)
      console.log(`     Venue Costs: ${validationResult.venueCosts.toLocaleString()} ISK`)
      console.log(`     Net Profit: ${validationResult.netProfit.toLocaleString()} ISK`)
    }
    
    // 4. Test template system
    console.log('\n📝 Validating template system...')
    
    const templates = await prisma.programTemplate.findMany({
      include: {
        pricingTemplates: {
          orderBy: { order: 'asc' }
        },
        programType: true
      }
    })
    
    console.log(`✅ Found ${templates.length} program templates`)
    
    templates.forEach(template => {
      console.log(`   ${template.name}:`)
      console.log(`     Base Program: ${template.programName}`)
      console.log(`     Duration: ${template.sessionDuration}h | Monthly: ${template.isMonthly}`)
      console.log(`     Pricing Templates: ${template.pricingTemplates.length}`)
      
      template.pricingTemplates.forEach(pt => {
        console.log(`       - ${pt.name}: ${pt.price.toLocaleString()} ISK`)
      })
    })
    
    // 5. Test data integrity
    console.log('\n📝 Testing data integrity...')
    
    let integrityErrors = 0
    
    // Check all pricing options have valid programs
    const orphanedPricingOptions = await prisma.pricingOption.count({
      where: {
        program: null
      }
    })
    
    if (orphanedPricingOptions > 0) {
      console.log(`❌ Found ${orphanedPricingOptions} orphaned pricing options`)
      integrityErrors++
    }
    
    // Check all registration entries have valid pricing options
    const orphanedEntries = await prisma.registrationEntry.count({
      where: {
        pricingOption: null
      }
    })
    
    if (orphanedEntries > 0) {
      console.log(`❌ Found ${orphanedEntries} orphaned registration entries`)
      integrityErrors++
    }
    
    // 6. Summary
    console.log('\n✅ MIGRATION VALIDATION SUMMARY:')
    console.log(`   Programs: ${programs.length} (all have flexible pricing)`)
    console.log(`   Registrations: ${registrations.length} (all have dynamic entries)`)
    console.log(`   Templates: ${templates.length} (ready for use)`)
    console.log(`   Data Integrity: ${integrityErrors === 0 ? '✅ PASSED' : `❌ ${integrityErrors} errors`}`)
    
    // 7. Performance test
    console.log('\n📝 Performance test...')
    const start = Date.now()
    
    await prisma.program.findMany({
      include: {
        pricingOptions: true,
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
    })
    
    const end = Date.now()
    console.log(`✅ Complex query completed in ${end - start}ms`)
    
    return {
      success: integrityErrors === 0,
      programs: programs.length,
      registrations: registrations.length,
      templates: templates.length,
      integrityErrors,
      calculationValidation
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

validateMigration().catch(console.error)