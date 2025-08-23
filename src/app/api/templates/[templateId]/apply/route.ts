import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    templateId: string
  }
}

// POST /api/templates/[templateId]/apply - Create program from template
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params
    const body = await request.json()
    const { yearId, overrides = {} } = body

    if (!yearId) {
      return NextResponse.json(
        { message: 'yearId is required' },
        { status: 400 }
      )
    }

    // Get the template
    const template = await prisma.programTemplate.findUnique({
      where: { id: templateId },
      include: {
        pricingTemplates: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      )
    }

    // Apply overrides to template data
    const programData = {
      name: overrides.name || template.programName,
      sessionDuration: overrides.sessionDuration || template.sessionDuration,
      isMonthly: overrides.isMonthly !== undefined ? overrides.isMonthly : template.isMonthly,
      venueSplitPercent: overrides.venueSplitPercent || template.venueSplitPercent
    }

    // Prepare pricing options (with overrides)
    const pricingOptions = template.pricingTemplates.map((pt, index) => {
      // Check if there's an override for this pricing option
      const override = overrides.pricingOptions?.find((po: any) => 
        po.name === pt.name || po.order === pt.order
      )
      
      return {
        name: override?.name || pt.name,
        price: override?.price || pt.price,
        order: override?.order !== undefined ? override.order : pt.order,
        isActive: override?.isActive !== undefined ? override.isActive : true
      }
    })

    // Add any completely new pricing options from overrides
    if (overrides.pricingOptions) {
      const newOptions = overrides.pricingOptions.filter((po: any) => 
        !template.pricingTemplates.some(pt => pt.name === po.name)
      )
      pricingOptions.push(...newOptions)
    }

    // Create program using the flexible program API logic
    const newProgram = await prisma.$transaction(async (tx) => {
      // Create the program
      const program = await tx.program.create({
        data: {
          yearId,
          programTypeId: template.programTypeId,
          name: programData.name,
          sessionDuration: programData.sessionDuration,
          isMonthly: programData.isMonthly,
          venueSplitPercentNew: programData.venueSplitPercent,
          // Legacy fields for compatibility
          fullPrice: pricingOptions[0]?.price || 0,
          halfPrice: pricingOptions[1]?.price || null,
          subscriptionPrice: pricingOptions.find(po => po.name.toLowerCase().includes('subscription'))?.price || null,
          venueSplitPercent: programData.venueSplitPercent
        }
      })

      // Create pricing options
      const pricingOptionData = pricingOptions.map((option: any, index: number) => ({
        programId: program.id,
        name: option.name,
        price: parseInt(option.price),
        order: option.order !== undefined ? option.order : index,
        isActive: option.isActive !== undefined ? option.isActive : true
      }))

      await tx.pricingOption.createMany({
        data: pricingOptionData
      })

      return program
    })

    // Fetch the complete program data to return
    const completeProgram = await prisma.program.findUnique({
      where: { id: newProgram.id },
      include: {
        pricingOptions: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        programType: true,
        year: true
      }
    })

    return NextResponse.json({
      program: completeProgram,
      templateUsed: {
        id: template.id,
        name: template.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error applying template:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}