import { prisma } from '../src/lib/prisma'
import { PrismaClient } from '@prisma/client'

async function executeMigration() {
  console.log('🚀 Starting database migration to flexible system...\n')
  
  try {
    // Step 1: Add new columns to programs table
    console.log('📝 Step 1: Adding new columns to programs table...')
    
    await prisma.$executeRaw`
      ALTER TABLE programs 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS session_duration DECIMAL(4,2) DEFAULT 1.5,
      ADD COLUMN IF NOT EXISTS is_monthly BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS venue_split_percent_new DECIMAL(5,2) DEFAULT 50.0
    `
    
    console.log('✅ New columns added to programs table')
    
    // Step 2: Create new tables
    console.log('📝 Step 2: Creating new tables...')
    
    // Create program_templates table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS program_templates (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          program_name VARCHAR(255) NOT NULL,
          session_duration DECIMAL(4,2) NOT NULL DEFAULT 1.5,
          is_monthly BOOLEAN NOT NULL DEFAULT false,
          venue_split_percent DECIMAL(5,2) NOT NULL DEFAULT 50.0,
          program_type_id TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create pricing_templates table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS pricing_templates (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          template_id TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          price INTEGER NOT NULL,
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create pricing_options table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS pricing_options (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          program_id TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          price INTEGER NOT NULL,
          "order" INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create registration_entries table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS registration_entries (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          registration_id TEXT NOT NULL,
          pricing_option_id TEXT NOT NULL,
          quantity INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(registration_id, pricing_option_id)
      )
    `
    
    console.log('✅ New tables created')
    
    // Step 3: Populate new program fields
    console.log('📝 Step 3: Populating new program fields...')
    
    const programs = await prisma.program.findMany({
      include: {
        programType: true
      }
    })
    
    for (const program of programs) {
      await prisma.$executeRaw`
        UPDATE programs 
        SET 
          name = ${program.programType.name},
          session_duration = ${program.programType.sessionHours},
          is_monthly = ${program.programType.isMonthly},
          venue_split_percent_new = ${program.venueSplitPercent}
        WHERE id = ${program.id}
      `
    }
    
    console.log('✅ Program fields populated')
    
    // Step 4: Create pricing options from existing programs
    console.log('📝 Step 4: Creating pricing options from existing programs...')
    
    for (const program of programs) {
      let order = 0
      
      // Always create Full Price option
      await prisma.$executeRaw`
        INSERT INTO pricing_options (program_id, name, price, "order")
        VALUES (${program.id}, 'Full Price', ${program.fullPrice}, ${order})
      `
      order++
      
      // Create Half Price option if it exists
      if (program.halfPrice) {
        await prisma.$executeRaw`
          INSERT INTO pricing_options (program_id, name, price, "order")
          VALUES (${program.id}, 'Half Price', ${program.halfPrice}, ${order})
        `
        order++
      }
      
      // Create Subscription option if it exists
      if (program.subscriptionPrice) {
        await prisma.$executeRaw`
          INSERT INTO pricing_options (program_id, name, price, "order")
          VALUES (${program.id}, 'Subscription', ${program.subscriptionPrice}, ${order})
        `
      }
    }
    
    console.log('✅ Pricing options created')
    
    // Step 5: Create registration entries from existing registrations
    console.log('📝 Step 5: Creating registration entries...')
    
    const registrations = await prisma.registration.findMany({
      include: {
        program: true
      }
    })
    
    for (const registration of registrations) {
      // Get pricing options for this program
      const pricingOptions = await prisma.$queryRaw`
        SELECT * FROM pricing_options WHERE program_id = ${registration.programId}
      ` as any[]
      
      const fullOption = pricingOptions.find((po: any) => po.name === 'Full Price')
      const halfOption = pricingOptions.find((po: any) => po.name === 'Half Price')
      const subOption = pricingOptions.find((po: any) => po.name === 'Subscription')
      
      // Create entries for non-zero quantities
      if (registration.fullRegistrations > 0 && fullOption) {
        await prisma.$executeRaw`
          INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
          VALUES (${registration.id}, ${fullOption.id}, ${registration.fullRegistrations})
        `
      }
      
      if (registration.halfRegistrations > 0 && halfOption) {
        await prisma.$executeRaw`
          INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
          VALUES (${registration.id}, ${halfOption.id}, ${registration.halfRegistrations})
        `
      }
      
      if (registration.subscriptionRegistrations > 0 && subOption) {
        await prisma.$executeRaw`
          INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
          VALUES (${registration.id}, ${subOption.id}, ${registration.subscriptionRegistrations})
        `
      }
    }
    
    console.log('✅ Registration entries created')
    
    // Step 6: Create default templates
    console.log('📝 Step 6: Creating default templates...')
    
    const programTypes = await prisma.programType.findMany()
    
    for (const programType of programTypes) {
      const templateId = await prisma.$queryRaw`
        INSERT INTO program_templates 
        (name, description, program_name, session_duration, is_monthly, venue_split_percent, program_type_id)
        VALUES (
          ${programType.name + ' Template'},
          ${'Auto-generated template from existing program type'},
          ${programType.name},
          ${programType.sessionHours},
          ${programType.isMonthly},
          50.0,
          ${programType.id}
        )
        RETURNING id
      ` as any[]
      
      const templateIdValue = templateId[0].id
      
      // Add common pricing templates
      await prisma.$executeRaw`
        INSERT INTO pricing_templates (template_id, name, price, "order") VALUES
        (${templateIdValue}, 'Full Price', 50000, 0),
        (${templateIdValue}, 'Half Price', 25000, 1)
      `
      
      if (programType.isMonthly) {
        await prisma.$executeRaw`
          INSERT INTO pricing_templates (template_id, name, price, "order") VALUES
          (${templateIdValue}, 'Monthly Pass', 61500, 2)
        `
      }
    }
    
    console.log('✅ Default templates created')
    
    // Step 7: Verify migration
    console.log('📝 Step 7: Verifying migration...')
    
    const newPricingOptions = await prisma.$queryRaw`SELECT COUNT(*) as count FROM pricing_options` as any[]
    const newRegistrationEntries = await prisma.$queryRaw`SELECT COUNT(*) as count FROM registration_entries` as any[]
    const newTemplates = await prisma.$queryRaw`SELECT COUNT(*) as count FROM program_templates` as any[]
    
    console.log(`✅ Migration completed successfully!`)
    console.log(`   - Pricing options created: ${newPricingOptions[0].count}`)
    console.log(`   - Registration entries created: ${newRegistrationEntries[0].count}`)
    console.log(`   - Templates created: ${newTemplates[0].count}`)
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n🔄 Rolling back changes...')
    
    // Rollback - remove new tables (columns will stay but that's safe)
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS registration_entries CASCADE`
      await prisma.$executeRaw`DROP TABLE IF EXISTS pricing_options CASCADE`
      await prisma.$executeRaw`DROP TABLE IF EXISTS pricing_templates CASCADE`
      await prisma.$executeRaw`DROP TABLE IF EXISTS program_templates CASCADE`
      console.log('✅ Rollback completed')
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError)
    }
    
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

executeMigration().catch(console.error)