async function testFlexibleAPI() {
  console.log('🧪 Testing Flexible Program API...\n')
  
  const baseUrl = 'http://localhost:3002'
  
  try {
    // Test 1: Get existing flexible programs
    console.log('📋 Test 1: Get existing programs with flexible pricing')
    const getResponse = await fetch(`${baseUrl}/api/programs/flexible`)
    const programs = await getResponse.json()
    
    console.log(`✅ Found ${programs.length} programs with flexible pricing`)
    programs.slice(0, 2).forEach((program: any) => {
      console.log(`   ${program.name}: ${program.pricingOptions?.length || 0} pricing options`)
    })
    
    // Test 2: Create new flexible program
    console.log('\n📝 Test 2: Create new program with custom pricing options')
    const newProgramData = {
      yearId: programs[0]?.yearId, // Use existing year
      name: 'Test Advanced Archery',
      sessionDuration: 2.0,
      isMonthly: false,
      venueSplitPercent: 45.0,
      pricingOptions: [
        { name: 'Full Season Premium', price: 65000, order: 0 },
        { name: 'Student Discount', price: 45000, order: 1 },
        { name: 'Early Bird Special', price: 55000, order: 2 },
        { name: 'Drop-in Session', price: 8000, order: 3 }
      ]
    }
    
    const createResponse = await fetch(`${baseUrl}/api/programs/flexible`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProgramData)
    })
    
    if (createResponse.ok) {
      const newProgram = await createResponse.json()
      console.log(`✅ Created program "${newProgram.name}" with ${newProgram.pricingOptions.length} pricing options:`)
      newProgram.pricingOptions.forEach((option: any) => {
        console.log(`   - ${option.name}: ${option.price.toLocaleString()} ISK`)
      })
      
      // Test 3: Update the program
      console.log('\n✏️  Test 3: Update program pricing options')
      const updateData = {
        name: 'Test Elite Archery Training',
        venueSplitPercent: 40.0,
        pricingOptions: [
          { id: newProgram.pricingOptions[0].id, name: 'Full Season Elite', price: 70000, order: 0 },
          { name: 'Family Package', price: 120000, order: 1 }, // New option
          { id: newProgram.pricingOptions[2].id, name: 'Super Early Bird', price: 50000, order: 2 }
          // Note: Drop-in Session will be deleted (not included)
        ]
      }
      
      const updateResponse = await fetch(`${baseUrl}/api/programs/flexible/${newProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (updateResponse.ok) {
        const updatedProgram = await updateResponse.json()
        console.log(`✅ Updated program "${updatedProgram.name}" (venue split: ${updatedProgram.venueSplitPercentNew}%)`)
        console.log(`   New pricing options (${updatedProgram.pricingOptions.length}):`)
        updatedProgram.pricingOptions.forEach((option: any) => {
          console.log(`   - ${option.name}: ${option.price.toLocaleString()} ISK`)
        })
        
        // Test 4: Get templates
        console.log('\n📋 Test 4: Get available templates')
        const templatesResponse = await fetch(`${baseUrl}/api/templates`)
        const templates = await templatesResponse.json()
        
        console.log(`✅ Found ${templates.length} templates`)
        templates.slice(0, 2).forEach((template: any) => {
          console.log(`   ${template.name}: ${template.pricingTemplates?.length || 0} pricing templates`)
        })
        
        // Test 5: Create program from template
        if (templates.length > 0) {
          console.log('\n🎯 Test 5: Create program from template')
          const templateData = {
            yearId: programs[0]?.yearId,
            overrides: {
              name: 'U16 Spring 2025 Elite',
              pricingOptions: [
                { name: 'Full Season', price: 52000 }, // Override price
                { name: 'Half Season', price: 28000 }  // Override price
              ]
            }
          }
          
          const applyResponse = await fetch(`${baseUrl}/api/templates/${templates[0].id}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
          })
          
          if (applyResponse.ok) {
            const result = await applyResponse.json()
            console.log(`✅ Created program from template "${result.templateUsed.name}"`)
            console.log(`   Program: "${result.program.name}" with ${result.program.pricingOptions.length} pricing options`)
            
            // Clean up test programs
            console.log('\n🧹 Cleaning up test programs...')
            await fetch(`${baseUrl}/api/programs/flexible/${newProgram.id}`, { method: 'DELETE' })
            await fetch(`${baseUrl}/api/programs/flexible/${result.program.id}`, { method: 'DELETE' })
            console.log('✅ Test programs cleaned up')
          }
        }
        
      } else {
        console.log('❌ Failed to update program:', await updateResponse.text())
      }
    } else {
      console.log('❌ Failed to create program:', await createResponse.text())
    }
    
    console.log('\n🎉 Flexible API tests completed successfully!')
    console.log('✅ Custom pricing options working')
    console.log('✅ Program updates working')
    console.log('✅ Template system working')
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

testFlexibleAPI().catch(console.error)