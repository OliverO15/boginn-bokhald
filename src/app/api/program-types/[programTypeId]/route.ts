import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ programTypeId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { programTypeId } = await params

    const programType = await prisma.programType.findUnique({
      where: { id: programTypeId },
      include: {
        programs: {
          include: {
            year: true
          }
        }
      }
    })

    if (!programType) {
      return NextResponse.json(
        { message: 'Program type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(programType)
  } catch (error) {
    console.error('Error fetching program type:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { programTypeId } = await params
    const body = await request.json()
    const { name, isMonthly, sessionHours } = body

    // Validate required fields
    if (!name || sessionHours === undefined) {
      return NextResponse.json(
        { message: 'Name and session hours are required' },
        { status: 400 }
      )
    }

    // Check if program type exists
    const existingProgramType = await prisma.programType.findUnique({
      where: { id: programTypeId }
    })

    if (!existingProgramType) {
      return NextResponse.json(
        { message: 'Program type not found' },
        { status: 404 }
      )
    }

    // Check if another program type with this name already exists (excluding current one)
    const nameConflict = await prisma.programType.findFirst({
      where: {
        name: name.trim(),
        id: { not: programTypeId }
      }
    })

    if (nameConflict) {
      return NextResponse.json(
        { message: 'Another program type with this name already exists' },
        { status: 400 }
      )
    }

    // Update the program type
    const updatedProgramType = await prisma.programType.update({
      where: { id: programTypeId },
      data: {
        name: name.trim(),
        isMonthly: Boolean(isMonthly),
        sessionHours: parseFloat(sessionHours),
      },
      include: {
        programs: {
          include: {
            year: true
          }
        }
      }
    })

    return NextResponse.json(updatedProgramType)
  } catch (error) {
    console.error('Error updating program type:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { programTypeId } = await params

    // Check if program type exists
    const existingProgramType = await prisma.programType.findUnique({
      where: { id: programTypeId },
      include: {
        programs: {
          include: {
            registrations: true,
            instructors: true
          }
        }
      }
    })

    if (!existingProgramType) {
      return NextResponse.json(
        { message: 'Program type not found' },
        { status: 404 }
      )
    }

    // Delete associated data in the correct order to respect foreign key constraints
    for (const program of existingProgramType.programs) {
      // Delete registrations first
      await prisma.registration.deleteMany({
        where: { programId: program.id }
      })

      // Delete program instructor assignments
      await prisma.programInstructor.deleteMany({
        where: { programId: program.id }
      })

      // Delete sessions
      await prisma.programSession.deleteMany({
        where: { 
          season: {
            programId: program.id
          }
        }
      })

      // Delete seasons
      await prisma.season.deleteMany({
        where: { programId: program.id }
      })
    }

    // Delete programs
    await prisma.program.deleteMany({
      where: { programTypeId }
    })

    // Finally, delete the program type
    await prisma.programType.delete({
      where: { id: programTypeId }
    })

    return NextResponse.json({ message: 'Program type deleted successfully' })
  } catch (error) {
    console.error('Error deleting program type:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}