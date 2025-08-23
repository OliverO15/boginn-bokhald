import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const programTypes = await prisma.programType.findMany({
      include: {
        programs: {
          include: {
            year: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(programTypes)
  } catch (error) {
    console.error('Error fetching program types:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isMonthly, sessionHours } = body

    // Validate required fields
    if (!name || sessionHours === undefined) {
      return NextResponse.json(
        { message: 'Name and session hours are required' },
        { status: 400 }
      )
    }

    // Check if program type with this name already exists
    const existingProgramType = await prisma.programType.findUnique({
      where: { name: name.trim() }
    })

    if (existingProgramType) {
      return NextResponse.json(
        { message: 'A program type with this name already exists' },
        { status: 400 }
      )
    }

    // Create the program type
    const newProgramType = await prisma.programType.create({
      data: {
        name: name.trim(),
        isMonthly: Boolean(isMonthly),
        sessionHours: parseFloat(sessionHours),
      }
    })

    return NextResponse.json(newProgramType, { status: 201 })
  } catch (error) {
    console.error('Error creating program type:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}