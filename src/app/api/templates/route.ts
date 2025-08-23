import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/templates - Get all program templates
export async function GET() {
  try {
    const templates = await prisma.programTemplate.findMany({
      include: {
        pricingTemplates: {
          orderBy: { order: 'asc' }
        },
        programType: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create new program template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      description,
      programName,
      sessionDuration,
      isMonthly,
      venueSplitPercent,
      programTypeId,
      pricingTemplates 
    } = body

    // Validate required fields
    if (!name || !programName || !sessionDuration || venueSplitPercent === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields: name, programName, sessionDuration, venueSplitPercent' },
        { status: 400 }
      )
    }

    if (!pricingTemplates || !Array.isArray(pricingTemplates) || pricingTemplates.length === 0) {
      return NextResponse.json(
        { message: 'At least one pricing template is required' },
        { status: 400 }
      )
    }

    // Create template with pricing templates in a transaction
    const newTemplate = await prisma.$transaction(async (tx) => {
      // Create the template
      const template = await tx.programTemplate.create({
        data: {
          name,
          description: description || null,
          programName,
          sessionDuration,
          isMonthly: isMonthly || false,
          venueSplitPercent,
          programTypeId: programTypeId || null
        }
      })

      // Create pricing templates
      const pricingTemplateData = pricingTemplates.map((pt: any, index: number) => ({
        templateId: template.id,
        name: pt.name,
        price: parseInt(pt.price),
        order: pt.order !== undefined ? pt.order : index
      }))

      await tx.pricingTemplate.createMany({
        data: pricingTemplateData
      })

      return template
    })

    // Fetch the complete template data to return
    const completeTemplate = await prisma.programTemplate.findUnique({
      where: { id: newTemplate.id },
      include: {
        pricingTemplates: {
          orderBy: { order: 'asc' }
        },
        programType: true
      }
    })

    return NextResponse.json(completeTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}