import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        season: true
      },
      orderBy: [
        { program: { year: { year: 'desc' } } },
        { program: { programType: { name: 'asc' } } }
      ]
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      programId, 
      seasonId, 
      month,
      fullRegistrations, 
      halfRegistrations, 
      subscriptionRegistrations 
    } = body

    // Validate required fields
    if (!programId) {
      return NextResponse.json(
        { message: 'Program is required' },
        { status: 400 }
      )
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { programType: true }
    })

    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    // Validate period selection
    if (program.programType.isMonthly) {
      if (!month || month < 1 || month > 12) {
        return NextResponse.json(
          { message: 'Valid month is required for monthly programs' },
          { status: 400 }
        )
      }
    } else {
      if (!seasonId) {
        return NextResponse.json(
          { message: 'Season is required for seasonal programs' },
          { status: 400 }
        )
      }
    }

    // Check for existing registration
    const existingRegistration = await prisma.registration.findFirst({
      where: program.programType.isMonthly 
        ? { programId, month: parseInt(month) }
        : { programId, seasonId }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'Registration already exists for this program and period' },
        { status: 400 }
      )
    }

    // Create the registration
    const newRegistration = await prisma.registration.create({
      data: {
        programId,
        seasonId: program.programType.isMonthly ? null : seasonId,
        month: program.programType.isMonthly ? parseInt(month) : null,
        fullRegistrations: parseInt(fullRegistrations) || 0,
        halfRegistrations: parseInt(halfRegistrations) || 0,
        subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0,
      },
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        season: true
      }
    })

    return NextResponse.json(newRegistration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}