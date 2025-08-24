import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/program-instructors - Assign instructor to program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, instructorId, seasonId, workDays } = body

    if (!programId || !instructorId || !workDays || !Array.isArray(workDays)) {
      return NextResponse.json(
        { message: 'Program ID, instructor ID, and work days are required' },
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

    const assignment = await prisma.programInstructor.create({
      data: {
        programId,
        instructorId,
        seasonId: seasonId || null,
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

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating program assignment:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Instructor is already assigned to this program' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to create program assignment' },
      { status: 500 }
    )
  }
}

// GET /api/program-instructors - Get all program-instructor assignments
export async function GET() {
  try {
    const assignments = await prisma.programInstructor.findMany({
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        instructor: true
      },
      orderBy: [
        { program: { year: { year: 'desc' } } },
        { program: { name: 'asc' } },
        { instructor: { name: 'asc' } }
      ]
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching program assignments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch program assignments' },
      { status: 500 }
    )
  }
}