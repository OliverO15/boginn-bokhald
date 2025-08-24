import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const years = await prisma.year.findMany({
      orderBy: { year: 'desc' },
      include: {
        programs: {
          include: {
            programType: true,
            seasons: true
          }
        }
      }
    })

    return NextResponse.json(years)
  } catch (error) {
    console.error('Error fetching years:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year } = body

    if (!year || typeof year !== 'number') {
      return NextResponse.json(
        { message: 'Year is required and must be a number' },
        { status: 400 }
      )
    }

    // Check if year already exists
    const existingYear = await prisma.year.findUnique({
      where: { year }
    })

    if (existingYear) {
      return NextResponse.json(
        { message: 'Year already exists' },
        { status: 400 }
      )
    }

    // Create the year
    const newYear = await prisma.year.create({
      data: { year }
    })

    return NextResponse.json(newYear, { status: 201 })
  } catch (error) {
    console.error('Error creating year:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}