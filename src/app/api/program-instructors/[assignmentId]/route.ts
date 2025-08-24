import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ assignmentId: string }>
}

// DELETE /api/program-instructors/[assignmentId] - Remove instructor from program
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { assignmentId } = await context.params

    await prisma.programInstructor.delete({
      where: { id: assignmentId }
    })

    return NextResponse.json({ message: 'Assignment removed successfully' })
  } catch (error) {
    console.error('Error removing assignment:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}

// PUT /api/program-instructors/[assignmentId] - Update instructor assignment
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { assignmentId } = await context.params
    const body = await request.json()
    const { workDays } = body

    if (!workDays || !Array.isArray(workDays)) {
      return NextResponse.json(
        { message: 'Work days are required' },
        { status: 400 }
      )
    }

    // Validate work days
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    const invalidDays = workDays.filter(day => !validDays.includes(day))
    
    if (invalidDays.length > 0) {
      return NextResponse.json(
        { message: `Invalid work days: ${invalidDays.join(', ')}` },
        { status: 400 }
      )
    }

    const assignment = await prisma.programInstructor.update({
      where: { id: assignmentId },
      data: {
        workDays: workDays
      },
      include: {
        program: {
          include: {
            programType: true
          }
        },
        instructor: true
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}