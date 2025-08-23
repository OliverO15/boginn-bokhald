import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ yearId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { yearId } = await params
    const body = await request.json()
    const { programTypeId, fullPrice, halfPrice, subscriptionPrice, venueSplitPercent } = body

    // Validate required fields
    if (!programTypeId || !fullPrice || venueSplitPercent === undefined) {
      return NextResponse.json(
        { message: 'Program type, full price, and venue split are required' },
        { status: 400 }
      )
    }

    // Check if year exists
    const year = await prisma.year.findUnique({
      where: { id: yearId }
    })

    if (!year) {
      return NextResponse.json(
        { message: 'Year not found' },
        { status: 404 }
      )
    }

    // Check if program type exists
    const programType = await prisma.programType.findUnique({
      where: { id: programTypeId }
    })

    if (!programType) {
      return NextResponse.json(
        { message: 'Program type not found' },
        { status: 404 }
      )
    }

    // Check if program already exists for this year and program type
    const existingProgram = await prisma.program.findUnique({
      where: {
        yearId_programTypeId: {
          yearId,
          programTypeId
        }
      }
    })

    if (existingProgram) {
      return NextResponse.json(
        { message: 'Program already exists for this year and program type' },
        { status: 400 }
      )
    }

    // Create the program
    const newProgram = await prisma.program.create({
      data: {
        yearId,
        programTypeId,
        fullPrice: parseInt(fullPrice),
        halfPrice: halfPrice ? parseInt(halfPrice) : null,
        subscriptionPrice: subscriptionPrice ? parseInt(subscriptionPrice) : null,
        venueSplitPercent: parseFloat(venueSplitPercent),
      },
      include: {
        programType: true
      }
    })

    return NextResponse.json(newProgram, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}