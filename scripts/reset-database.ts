import { prisma } from '../src/lib/prisma'

async function resetDatabase() {
  console.log('🔄 Resetting database...')
  
  try {
    // Delete all data in correct order (respecting foreign key constraints)
    console.log('Deleting all existing data...')
    
    await prisma.registrationEntry.deleteMany()
    await prisma.registration.deleteMany()
    await prisma.pricingOption.deleteMany()
    await prisma.pricingTemplate.deleteMany()
    await prisma.programTemplate.deleteMany()
    await prisma.programInstructor.deleteMany()
    await prisma.season.deleteMany()
    await prisma.program.deleteMany()
    await prisma.instructor.deleteMany()
    await prisma.programType.deleteMany()
    await prisma.year.deleteMany()
    
    console.log('✅ All data deleted')
    
    // Create fresh seed data
    console.log('🌱 Creating fresh seed data...')
    
    // 1. Create years
    const year2024 = await prisma.year.create({
      data: { year: 2024 }
    })
    
    const year2025 = await prisma.year.create({
      data: { year: 2025 }
    })
    
    console.log('✅ Created years: 2024, 2025')
    
    // 2. Create program types (for templates/categorization)
    const adultTraining = await prisma.programType.create({
      data: {
        name: 'Adult Training',
        isMonthly: false,
        sessionHours: 2.0
      }
    })
    
    const kidsTraining = await prisma.programType.create({
      data: {
        name: 'Kids Training', 
        isMonthly: false,
        sessionHours: 1.5
      }
    })
    
    const monthlyPass = await prisma.programType.create({
      data: {
        name: 'Monthly Pass',
        isMonthly: true,
        sessionHours: 2.0
      }
    })
    
    console.log('✅ Created program types: Adult Training, Kids Training, Monthly Pass')
    
    // 3. Create some instructors
    const instructor1 = await prisma.instructor.create({
      data: {
        name: 'Jón Ólafsson',
        hourlyWage: 8000
      }
    })
    
    const instructor2 = await prisma.instructor.create({
      data: {
        name: 'Anna Sigurðardóttir', 
        hourlyWage: 7500
      }
    })
    
    console.log('✅ Created instructors')
    
    // 4. Create program templates
    const adultTemplate = await prisma.programTemplate.create({
      data: {
        name: 'Standard Adult Program',
        description: 'Regular adult training with flexible pricing',
        programName: 'Adult Training',
        sessionDuration: 2.0,
        isMonthly: false,
        venueSplitPercent: 50.0,
        programTypeId: adultTraining.id
      }
    })
    
    // Add pricing templates for adult program
    await prisma.pricingTemplate.createMany({
      data: [
        { templateId: adultTemplate.id, name: 'Full Season', price: 60000, order: 0 },
        { templateId: adultTemplate.id, name: 'Student Rate', price: 45000, order: 1 },
        { templateId: adultTemplate.id, name: 'Senior Rate', price: 50000, order: 2 }
      ]
    })
    
    const kidsTemplate = await prisma.programTemplate.create({
      data: {
        name: 'Kids Program Template',
        description: 'Standard kids program with family-friendly pricing',
        programName: 'Kids Training',
        sessionDuration: 1.5,
        isMonthly: false,
        venueSplitPercent: 45.0,
        programTypeId: kidsTraining.id
      }
    })
    
    // Add pricing templates for kids program
    await prisma.pricingTemplate.createMany({
      data: [
        { templateId: kidsTemplate.id, name: 'Full Season', price: 40000, order: 0 },
        { templateId: kidsTemplate.id, name: 'Family Package (2 kids)', price: 65000, order: 1 }
      ]
    })
    
    console.log('✅ Created program templates with pricing options')
    
    // 5. Create some flexible programs for 2025
    const adultProgram2025 = await prisma.program.create({
      data: {
        yearId: year2025.id,
        programTypeId: adultTraining.id,
        name: 'Advanced Adult Training 2025',
        sessionDuration: 2.0,
        isMonthly: false,
        venueSplitPercentNew: 50.0,
        // Legacy fields (for compatibility)
        fullPrice: 60000,
        venueSplitPercent: 50.0
      }
    })
    
    // Add flexible pricing options for adult program
    await prisma.pricingOption.createMany({
      data: [
        { programId: adultProgram2025.id, name: 'Full Season', price: 60000, order: 0, isActive: true },
        { programId: adultProgram2025.id, name: 'Student Discount', price: 45000, order: 1, isActive: true },
        { programId: adultProgram2025.id, name: 'Early Bird Special', price: 52000, order: 2, isActive: true }
      ]
    })
    
    const kidsProgram2025 = await prisma.program.create({
      data: {
        yearId: year2025.id,
        programTypeId: kidsTraining.id,
        name: 'Youth Archery Program',
        sessionDuration: 1.5,
        isMonthly: false,
        venueSplitPercentNew: 45.0,
        // Legacy fields
        fullPrice: 40000,
        venueSplitPercent: 45.0
      }
    })
    
    // Add flexible pricing for kids program  
    await prisma.pricingOption.createMany({
      data: [
        { programId: kidsProgram2025.id, name: 'Individual', price: 40000, order: 0, isActive: true },
        { programId: kidsProgram2025.id, name: 'Sibling Discount', price: 35000, order: 1, isActive: true }
      ]
    })
    
    // Custom program without program type
    const customProgram = await prisma.program.create({
      data: {
        yearId: year2025.id,
        programTypeId: null, // No program type - fully custom
        name: 'Elite Competition Training',
        sessionDuration: 3.0,
        isMonthly: false,
        venueSplitPercentNew: 40.0,
        // Legacy fields
        fullPrice: 80000,
        venueSplitPercent: 40.0
      }
    })
    
    // Custom pricing for elite program
    await prisma.pricingOption.createMany({
      data: [
        { programId: customProgram.id, name: 'Full Program', price: 80000, order: 0, isActive: true },
        { programId: customProgram.id, name: 'Competition Only', price: 50000, order: 1, isActive: true },
        { programId: customProgram.id, name: 'Coaching Package', price: 120000, order: 2, isActive: true }
      ]
    })
    
    console.log('✅ Created flexible programs for 2025 with custom pricing')
    
    // 6. Create some seasons for the programs
    const season1 = await prisma.season.create({
      data: {
        yearId: year2025.id,
        name: 'Spring 2025',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31')
      }
    })
    
    const season2 = await prisma.season.create({
      data: {
        yearId: year2025.id,
        name: 'Fall 2025',
        startDate: new Date('2025-09-01'), 
        endDate: new Date('2025-11-30')
      }
    })
    
    console.log('✅ Created seasons for 2025')
    
    console.log('\\n🎉 Database reset complete!')
    console.log('\\nCreated:')
    console.log('- 2 years (2024, 2025)')
    console.log('- 3 program types')
    console.log('- 2 instructors') 
    console.log('- 2 program templates with pricing options')
    console.log('- 3 flexible programs for 2025 with custom pricing')
    console.log('- 2 seasons for 2025')
    console.log('\\nYou can now access the application at http://localhost:3002')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase().catch(console.error)