import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    programId: string
  }
}

// GET /api/programs/flexible/[programId] - Get single program with flexible pricing
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        pricingOptions: {
          orderBy: { order: 'asc' }
        },
        programType: true,
        year: true,
        registrations: {
          include: {
            entries: {
              include: {
                pricingOption: true
              }
            },
            season: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/programs/flexible/[programId] - Update program with flexible pricing
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params
    const body = await request.json()
    const { 
      name,
      sessionDuration,
      isMonthly,
      venueSplitPercent,
      pricingOptions 
    } = body

    // Validate program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
      include: { pricingOptions: true }
    })

    if (!existingProgram) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    // Update program and pricing options in a transaction
    const updatedProgram = await prisma.$transaction(async (tx) => {
      // Update the program
      const program = await tx.program.update({
        where: { id: programId },
        data: {
          name: name || existingProgram.name,
          sessionDuration: sessionDuration !== undefined ? sessionDuration : existingProgram.sessionDuration,
          isMonthly: isMonthly !== undefined ? isMonthly : existingProgram.isMonthly,
          venueSplitPercentNew: venueSplitPercent !== undefined ? venueSplitPercent : existingProgram.venueSplitPercentNew,
          // Update legacy fields for compatibility
          fullPrice: pricingOptions?.[0]?.price || existingProgram.fullPrice,
          venueSplitPercent: venueSplitPercent !== undefined ? venueSplitPercent : existingProgram.venueSplitPercent
        }
      })

      // If pricing options are provided, update them
      if (pricingOptions && Array.isArray(pricingOptions)) {
        // Get existing pricing option IDs
        const existingOptionIds = existingProgram.pricingOptions.map(po => po.id)
        const providedOptionIds = pricingOptions.filter(po => po.id).map(po => po.id)

        // Delete pricing options that are no longer provided
        const toDelete = existingOptionIds.filter(id => !providedOptionIds.includes(id))
        if (toDelete.length > 0) {
          await tx.pricingOption.deleteMany({
            where: {
              id: { in: toDelete },
              programId: programId
            }
          })
        }

        // Update or create pricing options
        for (let i = 0; i < pricingOptions.length; i++) {
          const option = pricingOptions[i]
          const optionData = {
            name: option.name,
            price: parseInt(option.price),
            order: option.order !== undefined ? option.order : i,
            isActive: option.isActive !== undefined ? option.isActive : true
          }

          if (option.id) {
            // Update existing option
            await tx.pricingOption.update({
              where: { id: option.id },
              data: optionData
            })
          } else {
            // Create new option
            await tx.pricingOption.create({
              data: {
                ...optionData,
                programId: programId
              }
            })
          }
        }
      }

      return program
    })

    // Fetch the complete updated program data
    const completeProgram = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        pricingOptions: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        programType: true,
        year: true
      }
    })

    return NextResponse.json(completeProgram)
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/programs/flexible/[programId] - Delete program and all pricing options
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params
    
    // Check if program has any registrations
    const registrationCount = await prisma.registration.count({
      where: { programId: programId }
    })

    if (registrationCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete program with ${registrationCount} existing registrations` },
        { status: 400 }
      )
    }

    // Delete program (pricing options will be deleted automatically due to cascade)
    await prisma.program.delete({
      where: { id: programId }
    })

    return NextResponse.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}