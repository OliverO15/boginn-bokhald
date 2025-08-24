import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/instructors - List all instructors
export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
        programAssignments: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                programType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(instructors)
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json(
      { message: 'Failed to fetch instructors' },
      { status: 500 }
    )
  }
}

// POST /api/instructors - Create new instructor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, hourlyWage } = body

    if (!name || !hourlyWage) {
      return NextResponse.json(
        { message: 'Name and hourly wage are required' },
        { status: 400 }
      )
    }

    const instructor = await prisma.instructor.create({
      data: {
        name: name.trim(),
        hourlyWage: parseInt(hourlyWage)
      }
    })

    return NextResponse.json(instructor, { status: 201 })
  } catch (error) {
    console.error('Error creating instructor:', error)
    return NextResponse.json(
      { message: 'Failed to create instructor' },
      { status: 500 }
    )
  }
}