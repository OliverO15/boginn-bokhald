import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ instructorId: string }>
}

// GET /api/instructors/[instructorId] - Get specific instructor
export async function GET(request: NextRequest, context: Context) {
  try {
    const { instructorId } = await context.params

    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        programAssignments: {
          include: {
            program: {
              include: {
                programType: true,
                year: true
              }
            }
          }
        }
      }
    })

    if (!instructor) {
      return NextResponse.json(
        { message: 'Instructor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(instructor)
  } catch (error) {
    console.error('Error fetching instructor:', error)
    return NextResponse.json(
      { message: 'Failed to fetch instructor' },
      { status: 500 }
    )
  }
}

// PUT /api/instructors/[instructorId] - Update instructor
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { instructorId } = await context.params
    const body = await request.json()
    const { name, hourlyWage } = body

    if (!name || !hourlyWage) {
      return NextResponse.json(
        { message: 'Name and hourly wage are required' },
        { status: 400 }
      )
    }

    const instructor = await prisma.instructor.update({
      where: { id: instructorId },
      data: {
        name: name.trim(),
        hourlyWage: parseInt(hourlyWage)
      }
    })

    return NextResponse.json(instructor)
  } catch (error) {
    console.error('Error updating instructor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Instructor not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to update instructor' },
      { status: 500 }
    )
  }
}

// DELETE /api/instructors/[instructorId] - Delete instructor
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { instructorId } = await context.params

    // Check if instructor has any program assignments
    const assignmentCount = await prisma.programInstructor.count({
      where: { instructorId }
    })

    if (assignmentCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete instructor with active program assignments. Remove assignments first.' },
        { status: 400 }
      )
    }

    await prisma.instructor.delete({
      where: { id: instructorId }
    })

    return NextResponse.json({ message: 'Instructor deleted successfully' })
  } catch (error) {
    console.error('Error deleting instructor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Instructor not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to delete instructor' },
      { status: 500 }
    )
  }
}