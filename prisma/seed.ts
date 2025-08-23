import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create program types based on your Excel data
  const programTypes = [
    {
      name: 'Adult Training',
      isMonthly: false,
      sessionHours: 1.5,
    },
    {
      name: 'Kids Training', 
      isMonthly: false,
      sessionHours: 1.5,
    },
    {
      name: 'U16 Training',
      isMonthly: false,
      sessionHours: 1.5,
    },
    {
      name: 'U21 Training',
      isMonthly: false,
      sessionHours: 2.0, // I noticed U21 uses 2 hours per session
    },
    {
      name: 'Monthly Pass',
      isMonthly: true,
      sessionHours: 0, // Not applicable for monthly passes
    },
    {
      name: 'Foundation Course',
      isMonthly: true,
      sessionHours: 0, // Not applicable 
    },
  ]

  for (const programType of programTypes) {
    await prisma.programType.upsert({
      where: { name: programType.name },
      update: {},
      create: programType,
    })
    console.log(`Created program type: ${programType.name}`)
  }

  // Create some sample instructors based on your data
  const instructors = [
    { name: 'Valgerður', hourlyWage: 3250 },
    { name: 'Heba', hourlyWage: 3000 },
    { name: 'Unnur', hourlyWage: 2000 },
    { name: 'Ragnar', hourlyWage: 2750 },
    { name: 'Sara', hourlyWage: 2400 },
    { name: 'Vala', hourlyWage: 3250 },
  ]

  for (const instructor of instructors) {
    const existing = await prisma.instructor.findFirst({
      where: { name: instructor.name }
    })
    
    if (existing) {
      await prisma.instructor.update({
        where: { id: existing.id },
        data: { hourlyWage: instructor.hourlyWage }
      })
      console.log(`Updated instructor: ${instructor.name}`)
    } else {
      await prisma.instructor.create({
        data: instructor
      })
      console.log(`Created instructor: ${instructor.name}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })